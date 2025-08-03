#!/bin/bash

# LeetCode Demo Deployment Script with HTTPS (CloudFront)
# This script builds the React app, deploys to S3, and sets up CloudFront for HTTPS

set -e  # Exit on any error

# Configuration
BUCKET_NAME="xz-leetcodes-demo"
BUILD_DIR="dist"
REGION="ap-southeast-2"
CLOUDFRONT_COMMENT="LeetCode Demo Distribution"

echo "🚀 Starting deployment process for LeetCode Demo with HTTPS..."

# Change to project root directory
cd "$(dirname "$0")/.."

# Step 1: Build the application
echo "📦 Building the application..."
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory '$BUILD_DIR' not found. Build may have failed."
    exit 1
fi

echo "✅ Build completed successfully!"

# Step 2: Upload files to S3 with proper content types
echo "📤 Uploading files to S3 bucket: $BUCKET_NAME..."

# Upload HTML files
aws s3 sync $BUILD_DIR/ s3://$BUCKET_NAME/ \
    --exclude "*" --include "*.html" \
    --content-type "text/html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --metadata-directive REPLACE

# Upload CSS files
aws s3 sync $BUILD_DIR/ s3://$BUCKET_NAME/ \
    --exclude "*" --include "*.css" \
    --content-type "text/css" \
    --cache-control "public, max-age=31536000" \
    --metadata-directive REPLACE

# Upload JS files
aws s3 sync $BUILD_DIR/ s3://$BUCKET_NAME/ \
    --exclude "*" --include "*.js" \
    --content-type "application/javascript" \
    --cache-control "public, max-age=31536000" \
    --metadata-directive REPLACE

# Upload SVG files
aws s3 sync $BUILD_DIR/ s3://$BUCKET_NAME/ \
    --exclude "*" --include "*.svg" \
    --content-type "image/svg+xml" \
    --cache-control "public, max-age=31536000" \
    --metadata-directive REPLACE

# Upload other files with default handling
aws s3 sync $BUILD_DIR/ s3://$BUCKET_NAME/ \
    --exclude "*.html" --exclude "*.css" --exclude "*.js" --exclude "*.svg" \
    --cache-control "public, max-age=31536000" \
    --metadata-directive REPLACE

echo "✅ Files uploaded with proper content types!"

# Step 3: Configure S3 bucket for CloudFront (not website hosting)
echo "🔧 Configuring S3 bucket for CloudFront access..."

# Set bucket policy for CloudFront OAI access
cat > bucket-policy-cloudfront.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy file://bucket-policy-cloudfront.json

# Clean up temporary policy file
rm bucket-policy-cloudfront.json

# Step 4: Check if CloudFront distribution already exists
echo "🔍 Checking for existing CloudFront distribution..."
EXISTING_DISTRIBUTION=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='$CLOUDFRONT_COMMENT'].Id" \
    --output text)

if [ -n "$EXISTING_DISTRIBUTION" ] && [ "$EXISTING_DISTRIBUTION" != "None" ]; then
    echo "📝 Found existing distribution: $EXISTING_DISTRIBUTION"
    DISTRIBUTION_ID="$EXISTING_DISTRIBUTION"
    
    # Create invalidation to clear cache
    echo "🔄 Creating CloudFront invalidation..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id $DISTRIBUTION_ID \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    echo "✅ Invalidation created: $INVALIDATION_ID"
else
    # Step 5: Create CloudFront distribution
    echo "☁️ Creating CloudFront distribution..."
    
    cat > cloudfront-config.json << EOF
{
    "CallerReference": "leetcode-demo-$(date +%s)",
    "Comment": "$CLOUDFRONT_COMMENT",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "$BUCKET_NAME-origin",
                "DomainName": "$BUCKET_NAME.s3.$REGION.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "$BUCKET_NAME-origin",
        "ViewerProtocolPolicy": "redirect-to-https",
        "MinTTL": 0,
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        }
    },
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
EOF

    DISTRIBUTION_RESPONSE=$(aws cloudfront create-distribution \
        --distribution-config file://cloudfront-config.json)
    
    DISTRIBUTION_ID=$(echo "$DISTRIBUTION_RESPONSE" | jq -r '.Distribution.Id')
    
    # Clean up temporary config file
    rm cloudfront-config.json
    
    echo "✅ CloudFront distribution created: $DISTRIBUTION_ID"
fi

# Step 6: Get distribution details
echo "📊 Getting distribution details..."
DISTRIBUTION_DOMAIN=$(aws cloudfront get-distribution \
    --id $DISTRIBUTION_ID \
    --query 'Distribution.DomainName' \
    --output text)

DISTRIBUTION_STATUS=$(aws cloudfront get-distribution \
    --id $DISTRIBUTION_ID \
    --query 'Distribution.Status' \
    --output text)

# Step 7: Display results
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📍 S3 Bucket Details:"
echo "   Bucket Name: $BUCKET_NAME"
echo "   Region: $REGION"
echo ""
echo "☁️ CloudFront Distribution:"
echo "   Distribution ID: $DISTRIBUTION_ID"
echo "   Status: $DISTRIBUTION_STATUS"
echo ""
echo "🌍 Website URLs:"
echo "   HTTPS (Recommended): https://$DISTRIBUTION_DOMAIN"
echo "   HTTP (S3 Direct): http://$BUCKET_NAME.s3-website-ap-southeast-2.amazonaws.com"
echo ""
echo "🧪 Test your HTTPS deployment:"
echo "   curl -I https://$DISTRIBUTION_DOMAIN"
echo "   or visit the HTTPS URL in your browser"
echo ""
if [ "$DISTRIBUTION_STATUS" = "InProgress" ]; then
    echo "⏳ Note: CloudFront distribution is still deploying."
    echo "   It may take 15-20 minutes for the distribution to be fully available."
    echo "   You can check status with:"
    echo "   aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.Status'"
else
    echo "✅ CloudFront distribution is ready!"
fi

echo ""
echo "💡 Tips:"
echo "   - Use the HTTPS URL for production"
echo "   - CloudFront provides global CDN caching"
echo "   - Future deployments will invalidate the cache automatically"