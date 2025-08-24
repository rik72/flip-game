#!/bin/bash

# Flipgame Complete AWS Deployment Script
# This script prepares files, uploads to S3, and invalidates CloudFront cache

set -e  # Exit on any error

# =============================================================================
# CONFIGURATION - UPDATE THESE VALUES
# =============================================================================

# AWS Configuration
BUCKET_NAME="flipgame-webapp"
AWS_REGION="eu-west-1"
DISTRIBUTION_ID="ES8X3NQK1I2HM"  # Add your CloudFront distribution ID here

# Deployment Configuration
DEPLOY_DIR="flipgame-deploy"
SOURCE_DIR="."

# Invalidation Configuration
INVALIDATE_ALL=true  # Set to false to invalidate specific paths only
INVALIDATION_PATHS="/*"  # Use "/*" for all files, or specific paths like "/managers/*"

# =============================================================================
# COLORS FOR OUTPUT
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_step() {
    echo -e "${YELLOW}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# =============================================================================
# VALIDATION CHECKS
# =============================================================================

print_header "Flipgame AWS Deployment Script"

# Check if we're in the right directory
if [ ! -f "index.html" ] || [ ! -f "app.js" ]; then
    print_error "This script must be run from the flipgame project root directory"
    echo "Please navigate to your flipgame project folder and run this script again."
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS is configured (optional check)
print_step "Testing AWS credentials..."
if aws sts get-caller-identity &> /dev/null; then
    print_success "AWS credentials are valid"
else
    print_warning "AWS credentials test failed, but continuing with deployment..."
    print_info "If deployment fails, check your IAM user permissions"
fi

# Check if bucket name is set
if [ -z "$BUCKET_NAME" ] || [ "$BUCKET_NAME" = "flipgame-your-unique-identifier" ]; then
    print_error "Please update BUCKET_NAME in the script configuration"
    exit 1
fi

# Check if distribution ID is set (only if invalidation is enabled)
if [ "$INVALIDATE_ALL" = true ] && [ -z "$DISTRIBUTION_ID" ]; then
    print_error "Please update DISTRIBUTION_ID in the script configuration for CloudFront invalidation"
    exit 1
fi

print_success "All validation checks passed!"

# =============================================================================
# STEP 1: PREPARE FILES
# =============================================================================

print_header "Step 1: Preparing Files for Deployment"

print_step "Running preparation script..."
if [ -f "./prepare-deployment.sh" ]; then
    ./prepare-deployment.sh
    print_success "Files prepared successfully"
else
    print_error "prepare-deployment.sh not found"
    exit 1
fi

# =============================================================================
# STEP 2: CHECK S3 BUCKET
# =============================================================================

print_header "Step 2: Validating S3 Bucket"

print_step "Checking if S3 bucket exists..."
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    print_error "Bucket '$BUCKET_NAME' does not exist"
    echo "Please create the bucket first using the AWS Console or run:"
    echo "aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION"
    exit 1
fi
print_success "S3 bucket '$BUCKET_NAME' exists"

# =============================================================================
# STEP 3: UPLOAD FILES TO S3
# =============================================================================

print_header "Step 3: Uploading Files to S3"

print_step "Uploading files to S3 bucket..."
cd "$DEPLOY_DIR"

# Upload all files recursively
aws s3 sync . "s3://$BUCKET_NAME" --delete

print_success "Files uploaded to S3"

# Set proper content types for important files
print_step "Setting content types for key files..."
aws s3 cp index.html "s3://$BUCKET_NAME/" --content-type "text/html" --cache-control "no-cache"
aws s3 cp app.js "s3://$BUCKET_NAME/" --content-type "application/javascript" --cache-control "no-cache"
aws s3 cp styles.css "s3://$BUCKET_NAME/" --content-type "text/css" --cache-control "no-cache"

# Set content types for other file types
print_step "Setting content types for other files..."
find . -name "*.json" -exec aws s3 cp {} "s3://$BUCKET_NAME/{}" --content-type "application/json" \;
find . -name "*.svg" -exec aws s3 cp {} "s3://$BUCKET_NAME/{}" --content-type "image/svg+xml" \;
find . -name "*.mp3" -exec aws s3 cp {} "s3://$BUCKET_NAME/{}" --content-type "audio/mpeg" \;

cd ..

print_success "Content types set successfully"

# =============================================================================
# STEP 4: CLOUDFRONT INVALIDATION
# =============================================================================

if [ "$INVALIDATE_ALL" = true ] && [ ! -z "$DISTRIBUTION_ID" ]; then
    print_header "Step 4: CloudFront Cache Invalidation"
    
    print_step "Creating CloudFront invalidation..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$DISTRIBUTION_ID" \
        --paths "$INVALIDATION_PATHS" \
        --query 'Invalidation.Id' \
        --output text)
    
    print_success "CloudFront invalidation created with ID: $INVALIDATION_ID"
    
    print_info "Invalidation will take 5-15 minutes to complete"
    print_info "You can check status with: aws cloudfront get-invalidation --distribution-id $DISTRIBUTION_ID --id $INVALIDATION_ID"
else
    print_info "Skipping CloudFront invalidation (DISTRIBUTION_ID not set or INVALIDATE_ALL=false)"
fi

# =============================================================================
# DEPLOYMENT SUMMARY
# =============================================================================

print_header "Deployment Summary"

print_success "Deployment completed successfully!"
echo ""
echo -e "${CYAN}📊 Deployment Details:${NC}"
echo "=========================="
echo -e "📦 S3 Bucket: ${YELLOW}$BUCKET_NAME${NC}"
echo -e "🌍 Region: ${YELLOW}$AWS_REGION${NC}"
if [ ! -z "$DISTRIBUTION_ID" ]; then
    echo -e "☁️  CloudFront Distribution: ${YELLOW}$DISTRIBUTION_ID${NC}"
fi
echo ""
echo -e "${CYAN}🌐 Your URLs:${NC}"
echo "================"
echo -e "S3 Website: ${YELLOW}http://$BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com${NC}"
if [ ! -z "$DISTRIBUTION_ID" ]; then
    echo -e "CloudFront: ${YELLOW}https://$DISTRIBUTION_ID.cloudfront.net${NC}"
fi
echo ""
echo -e "${CYAN}⏱️  Next Steps:${NC}"
echo "================"
if [ "$INVALIDATE_ALL" = true ] && [ ! -z "$DISTRIBUTION_ID" ]; then
    echo "1. ⏳ Wait 5-15 minutes for CloudFront invalidation to complete"
    echo "2. 🌐 Test your game at the CloudFront URL"
else
    echo "1. 🌐 Test your game at the S3 website URL"
    echo "2. 🔄 Create CloudFront invalidation manually if needed"
fi
echo "3. 📊 Monitor deployment in AWS Console"
echo ""
print_success "🚀 Your Flipgame is now deployed to AWS!" 