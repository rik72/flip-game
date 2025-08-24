# AWS S3 + CloudFront Deployment Checklist (Web Console)

## ✅ Pre-Deployment
- [ ] Create `flipgame-deploy` folder on your computer
- [ ] Copy all game files (excluding development files)
- [ ] Ensure you have AWS account access

## ✅ Step 1: Create S3 Bucket
- [ ] Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
- [ ] Click "Create bucket"
- [ ] Enter bucket name: `flipgame-[your-unique-identifier]`
- [ ] Choose region: `Europe (Ireland) eu-west-1`
- [ ] Enable bucket versioning
- [ ] Enable default encryption (SSE-S3)
- [ ] Click "Create bucket"
- [ ] **Note**: Block Public Access is enabled by default (we'll disable it in Step 3)

## ✅ Step 2: Configure S3 for Website Hosting
- [ ] Select your bucket
- [ ] Go to "Properties" tab
- [ ] Enable "Static website hosting"
- [ ] Set index document: `index.html`
- [ ] Set error document: `index.html`
- [ ] Save changes

## ✅ Step 3: Set Bucket Permissions
- [ ] Go to "Permissions" tab
- [ ] **First**: Go to "Block public access (bucket settings)"
- [ ] Click "Edit"
- [ ] Uncheck all boxes to allow public access
- [ ] Click "Save changes" and type "confirm"
- [ ] **Then**: Click "Bucket policy"
- [ ] Add public read policy (see guide for JSON)
- [ ] Save changes

## ✅ Step 4: Upload Files
- [ ] In S3 bucket, click "Upload"
- [ ] Drag and drop all files from `flipgame-deploy` folder
- [ ] Set content types for key files:
  - [ ] `index.html` → `text/html`
  - [ ] `app.js` → `application/javascript`
  - [ ] `styles.css` → `text/css`
  - [ ] `.json` files → `application/json`
  - [ ] `.svg` files → `image/svg+xml`
  - [ ] `.mp3` files → `audio/mpeg`
- [ ] Click "Upload"

## ✅ Step 5: Create CloudFront Distribution
- [ ] Go to [AWS CloudFront Console](https://console.aws.amazon.com/cloudfront/)
- [ ] Click "Create Distribution"
- [ ] Select your S3 bucket as origin
- [ ] Configure cache behavior:
  - [ ] Redirect HTTP to HTTPS
  - [ ] Use "CachingOptimized" policy
  - [ ] Use "CORS-S3Origin" origin request policy
  - [ ] Use "CORS-CustomOrigin" response headers policy
  - [ ] Enable compression
- [ ] Set default root object: `index.html`
- [ ] Click "Create Distribution"

## ✅ Step 6: Configure Error Pages
- [ ] In CloudFront distribution, go to "Error Pages" tab
- [ ] Create custom error response for 403:
  - [ ] HTTP Error Code: `403: Forbidden`
  - [ ] Response Page Path: `/index.html`
  - [ ] HTTP Response Code: `200: OK`
- [ ] Create custom error response for 404:
  - [ ] HTTP Error Code: `404: Not Found`
  - [ ] Response Page Path: `/index.html`
  - [ ] HTTP Response Code: `200: OK`

## ✅ Step 7: Configure CORS (if needed)
- [ ] Go back to S3 bucket
- [ ] Go to "Permissions" tab
- [ ] Click "Cross-origin resource sharing (CORS)"
- [ ] Add CORS configuration (see guide for JSON)
- [ ] Save changes

## ✅ Step 8: Test Deployment
- [ ] Wait for CloudFront to deploy (5-15 minutes)
- [ ] Test S3 website endpoint
- [ ] Test CloudFront distribution URL
- [ ] Test on different devices/browsers

## ✅ Step 9: Optional - Custom Domain
- [ ] Register domain or use existing
- [ ] Create SSL certificate in ACM
- [ ] Add domain to CloudFront CNAMEs
- [ ] Update DNS records

## ✅ Step 10: Monitoring Setup
- [ ] Enable S3 access logging (optional)
- [ ] Enable CloudFront access logging (optional)
- [ ] Monitor CloudWatch metrics

## 🔄 Update Process (for future updates)
- [ ] Upload new files to S3 bucket
- [ ] Create CloudFront invalidation (`/*`)
- [ ] Test updated deployment

## 📊 Your URLs
- **S3 Website**: `http://[bucket-name].s3-website-eu-west-1.amazonaws.com`
- **CloudFront**: `https://[distribution-id].cloudfront.net`

## 💰 Estimated Costs
- **S3**: ~$0.023/GB stored + $0.0004/1K requests
- **CloudFront**: ~$0.085/GB transferred + $0.0075/10K requests
- **Typical cost**: Under $10/month for moderate traffic

---

**Need help?** See the detailed guide in `AWS_DEPLOYMENT_GUIDE.md` 