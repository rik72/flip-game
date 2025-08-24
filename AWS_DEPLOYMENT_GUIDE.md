# AWS S3 + CloudFront Deployment Guide for Flipgame (Web Console Only)

This guide provides step-by-step instructions for manually deploying your Flipgame to AWS S3 with CloudFront using only the AWS Web Console.

## Prerequisites

- AWS Account with appropriate permissions
- Basic knowledge of AWS S3 and CloudFront services
- All your game files ready for deployment

## Region Selection

This guide uses **Europe (Ireland) eu-west-1** region to:
- Keep your applications in the same region for easier management
- Maintain consistency with your existing webapps
- Provide excellent performance for European users
- Work seamlessly with CloudFront global CDN

## Step 1: Prepare Your Files for Deployment

### 1.1 Create a deployment package
1. Create a new folder on your computer called `flipgame-deploy`
2. Copy the following files and folders from your project:
   - `index.html` (main entry point)
   - `app.js` (main application)
   - `app-bridge.js`
   - `constants.js`
   - `utils.js`
   - `html-builder.js`
   - `display-manager.js`
   - `styles.css`
   - `favicon.svg`
   - `editor_favicon.svg`
   - `editor.html`
   - `editor_styles.css`
   - `assets/` directory (CSS, JS, fonts, sounds)
   - `levels/` directory (all JSON level files)
   - `managers/` directory (all manager files)

### 1.2 Files to exclude:
- `node_modules/`
- `package.json`
- `package-lock.json`
- `*.md` files (except README.md if desired)
- `screenshots/`
- Development scripts and validation files

## Step 2: Create S3 Bucket

### 2.1 Create the bucket
1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Click "Create bucket"
3. Enter bucket name: `flipgame-[your-unique-identifier]` (must be globally unique)
4. Choose region: `Europe (Ireland) eu-west-1` (works great with CloudFront and keeps your apps in the same region)
5. Click "Next"

### 2.2 Configure options
1. **Object Ownership**: Keep default (ACLs disabled)
2. **Block Public Access settings**: Keep all blocks enabled initially (we'll disable them later for static website hosting)
3. **Bucket Versioning**: Enable (recommended)
4. **Tags**: Add tags if desired (optional)
5. **Default encryption**: Enable SSE-S3
6. Click "Next"

### 2.3 Review and create
1. Review your settings
2. Click "Create bucket"

## Step 3: Configure S3 Bucket for Static Website Hosting

### 3.1 Enable static website hosting
1. Select your newly created bucket
2. Go to "Properties" tab
3. Scroll down to "Static website hosting"
4. Click "Edit"
5. Select "Enable"
6. Configure:
   - **Index document**: `index.html`
   - **Error document**: `index.html` (for SPA routing)
7. Click "Save changes"

### 3.2 Disable block public access (required first)
1. In "Permissions" tab, click "Block public access (bucket settings)"
2. Click "Edit"
3. Uncheck all boxes to allow public access
4. Click "Save changes"
5. Type "confirm" and click "Confirm"

### 3.3 Create bucket policy for public read access
1. Still in "Permissions" tab, click "Bucket policy"
2. Click "Edit"
3. Paste the following policy (replace `[your-bucket-name]` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::[your-bucket-name]/*"
        }
    ]
}
```

4. Click "Save changes"

## Step 4: Upload Files to S3

### 4.1 Upload files
1. In your S3 bucket, click "Upload"
2. Click "Add files" or drag and drop all files and folders from your `flipgame-deploy` directory
3. Click "Next"

### 4.2 Configure upload options
1. **Storage class**: Keep default (Standard)
2. **Additional upload options**: Click to expand
3. **Metadata**: Add custom metadata for important files:
   - For `index.html`: Key = `Content-Type`, Value = `text/html`
   - For `app.js`: Key = `Content-Type`, Value = `application/javascript`
   - For `styles.css`: Key = `Content-Type`, Value = `text/css`
   - For `.json` files: Key = `Content-Type`, Value = `application/json`
   - For `.svg` files: Key = `Content-Type`, Value = `image/svg+xml`
   - For `.mp3` files: Key = `Content-Type`, Value = `audio/mpeg`
4. Click "Next"

### 4.3 Review and upload
1. Review your upload settings
2. Click "Upload"
3. Wait for upload to complete

### 4.4 Set content types for existing files (if needed)
1. Select files that need content type correction
2. Click "Actions" → "Edit metadata"
3. Add or modify the `Content-Type` metadata
4. Click "Save changes"

## Step 5: Create CloudFront Distribution

### 5.1 Create distribution
1. Go to [AWS CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Click "Create Distribution"
3. In "Origin settings":
   - **Origin Domain**: Select your S3 bucket from the dropdown
   - **Origin Path**: Leave empty
   - **Origin ID**: `flipgame-origin` (auto-generated)

### 5.2 Configure default cache behavior
1. **Viewer Protocol Policy**: `Redirect HTTP to HTTPS`
2. **Allowed HTTP Methods**: `GET, HEAD, OPTIONS`
3. **Cache Policy**: `CachingOptimized` (or select "Create cache policy" for custom)
4. **Origin Request Policy**: `CORS-S3Origin`
5. **Response Headers Policy**: `CORS-CustomOrigin`
6. **Compress Objects Automatically**: `Yes`

### 5.3 Configure distribution settings
1. **Price Class**: `Use Only North America and Europe` (or as needed)
2. **Alternate Domain Names (CNAMEs)**: Leave empty (add custom domain later if desired)
3. **SSL Certificate**: `Default CloudFront Certificate`
4. **Default Root Object**: `index.html`
5. **Custom Error Pages**: We'll configure this after creation
6. Click "Create Distribution"

## Step 6: Configure CloudFront Error Pages

### 6.1 Create custom error response for 403
1. In your CloudFront distribution, go to "Error Pages" tab
2. Click "Create custom error response"
3. Configure:
   - **HTTP Error Code**: `403: Forbidden`
   - **Error Caching Minimum TTL**: `0`
   - **Customize Error Response**: `Yes`
   - **Response Page Path**: `/index.html`
   - **HTTP Response Code**: `200: OK`
4. Click "Create"

### 6.2 Create custom error response for 404
1. Click "Create custom error response" again
2. Configure:
   - **HTTP Error Code**: `404: Not Found`
   - **Error Caching Minimum TTL**: `0`
   - **Customize Error Response**: `Yes`
   - **Response Page Path**: `/index.html`
   - **HTTP Response Code**: `200: OK`
3. Click "Create"

## Step 7: Configure CORS (if needed)

### 7.1 Add CORS configuration to S3 bucket
1. Go back to your S3 bucket
2. Go to "Permissions" tab
3. Scroll down to "Cross-origin resource sharing (CORS)"
4. Click "Edit"
5. Paste the following configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

6. Click "Save changes"

## Step 8: Test Your Deployment

### 8.1 Test S3 static website
1. Go to your S3 bucket → "Properties" tab
2. Scroll to "Static website hosting"
3. Click the website endpoint URL
4. Verify the game loads correctly

### 8.2 Test CloudFront distribution
1. Wait for CloudFront distribution to deploy (usually 5-15 minutes)
2. Go to CloudFront console and copy your distribution domain name
3. Open the CloudFront URL in your browser
4. Test on different devices and browsers

## Step 9: Custom Domain (Optional)

### 9.1 Register domain or use existing
1. Use Route 53 or external registrar
2. Create SSL certificate in AWS Certificate Manager (ACM)

### 9.2 Update CloudFront distribution
1. In your CloudFront distribution, go to "General" tab
2. Click "Edit"
3. Add your domain to "Alternate Domain Names (CNAMEs)"
4. Select your SSL certificate
5. Click "Yes, Edit"
6. Update your DNS to point to the CloudFront distribution

## Step 10: Monitoring and Maintenance

### 10.1 Set up monitoring
1. **CloudWatch metrics**: Automatically enabled for CloudFront
2. **S3 access logging**: Enable in S3 bucket properties if desired
3. **CloudFront access logs**: Enable in distribution settings if desired

### 10.2 Update process
1. **Upload new files**: Go to S3 bucket and upload updated files
2. **Invalidate cache**: In CloudFront distribution, go to "Invalidations" tab
3. Click "Create invalidation"
4. Enter `/*` to invalidate all files
5. Click "Create invalidation"

## Troubleshooting

### Common Issues:

1. **CORS errors**: Ensure CORS is properly configured on S3
2. **404 errors on refresh**: Make sure error pages redirect to index.html
3. **Assets not loading**: Check file paths and content types in S3
4. **Slow loading**: Verify CloudFront is serving from edge locations

### Performance Optimization:

1. **Enable compression** in CloudFront (already configured)
2. **Set appropriate cache headers** for static assets
3. **Monitor CloudWatch metrics** for performance insights
4. **Use CloudFront Functions** for custom caching rules (advanced)

## Cost Estimation

- **S3**: ~$0.023 per GB stored + $0.0004 per 1,000 requests
- **CloudFront**: ~$0.085 per GB transferred + $0.0075 per 10,000 requests
- **Data Transfer**: Varies by region and usage

For a typical game deployment, expect costs under $10/month for moderate traffic.

## Security Considerations

1. **HTTPS only**: CloudFront enforces HTTPS
2. **No sensitive data**: Ensure no API keys or secrets in client-side code
3. **Regular updates**: Keep dependencies updated
4. **Access logging**: Monitor for unusual access patterns

---

**Your game will be available at**: `https://[DISTRIBUTION-ID].cloudfront.net`

Replace `[your-unique-identifier]` and `[DISTRIBUTION-ID]` with your actual values throughout this guide. 