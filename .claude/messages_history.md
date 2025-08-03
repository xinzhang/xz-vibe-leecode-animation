# Messages History - LeetCode Demo Project

This file contains a summarized history of questions and solutions from the chat session.

## Session Overview
- **Project**: LeetCode Animation Demo (React + TypeScript + Vite)
- **Main Goal**: Deploy React app to AWS S3 with HTTPS via CloudFront
- **Date**: August 3, 2025

---

## Q&A Summary

### 1. Initial Deployment Setup
**Question**: Create deployment script for AWS S3 with public access and HTTPS

**Solution**: 
- Created `deploy-https.sh` script with full S3 + CloudFront setup
- Configured bucket for static website hosting with index.html default
- Set up CloudFront distribution for HTTPS access
- Applied public access policies and disabled block public access settings
- **Result**: Both HTTP and HTTPS URLs working

### 2. Region Configuration Issue
**Question**: Getting PermanentRedirect error pointing to ap-southeast-2 region

**Solution**:
- Updated deployment script region from `us-east-1` to `ap-southeast-2`
- Fixed all region-specific URL references in script
- **Result**: Deployment script now uses correct Sydney region

### 3. Content-Type Download Issue
**Question**: Website downloading HTML instead of displaying in browser

**Solution**:
- Identified S3 objects had wrong content-type (`binary/octet-stream`)
- Fixed content-types: HTML→`text/html`, CSS→`text/css`, JS→`application/javascript`, SVG→`image/svg+xml`
- Updated deployment script to automatically set correct MIME types
- Created CloudFront invalidation to clear cache
- **Result**: Website displays properly in browser

### 4. File Organization
**Question**: Move deployment-related files to organized folder structure

**Solution**:
- Created `deploy/` folder
- Moved `deploy-https.sh` to `deploy/` directory
- Updated script paths to work from deploy folder (auto-navigate to project root)
- **Result**: Clean project structure with organized deployment files

### 7. Clean Deployment Process
**Question**: Ensure deployment removes old files to prevent leftover assets

**Solution**:
- Added `aws s3 rm s3://bucket --recursive` before upload
- Verified command only targets specific bucket (`xz-leetcodes-demo`)
- **Result**: Each deployment starts with clean slate, no leftover files

### 8. Public Access Fix
**Question**: Getting 403 errors on S3 website endpoint after deployment

**Solution**:
- Identified bucket policy only allowed CloudFront access, blocking S3 website hosting
- Updated bucket policy to allow both CloudFront service access AND public read access
- Applied dual-access policy immediately and updated deployment script
- **Result**: Both S3 website (HTTP) and CloudFront (HTTPS) URLs working

### 9. Documentation Updates
**Question**: Update README to describe the actual application purpose

**Solution**:
- Rewrote README.md to focus on LeetCode algorithm visualization
- Added live demo URLs and development/deployment instructions
- Removed default Vite template content
- **Result**: Clear documentation explaining the app's purpose and usage

---

## Final State

### URLs
- **HTTPS (Production)**: https://d1h3x3r79e3lqd.cloudfront.net/
- **HTTP (S3 Direct)**: http://xz-leetcodes-demo.s3-website-ap-southeast-2.amazonaws.com/

### Key Files
- `deploy/deploy-https.sh` - Complete deployment automation
- `src/leetcode-2106-animation.tsx` - Main component (renamed)
- `public/leetcodeanim.svg` - Custom favicon with animations
- `README.md` - Updated project documentation

### AWS Resources
- **S3 Bucket**: `xz-leetcodes-demo` (ap-southeast-2 region)
- **CloudFront Distribution**: `EPSO300794M4O` (d1h3x3r79e3lqd.cloudfront.net)
- **Bucket Policy**: Dual access (CloudFront + Public read)

### Project Structure
```
leetcode-demo/
├── deploy/
│   └── deploy-https.sh
├── public/
│   └── leetcodeanim.svg
├── src/
│   └── leetcode-2106-animation.tsx
├── .claude/
│   └── messages_history.md
└── README.md
```

---

## Lessons Learned
1. S3 website hosting requires public read access, separate from CloudFront access
2. Content-Type headers are critical for proper browser display
3. Region consistency is essential for S3 operations
4. Clean deployments prevent asset conflicts
5. Proper file organization improves maintainability