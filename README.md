# Player for NECOsport

# Nightwatch tests

```
npm run build
cd dist/ && live--server
npm run test-nightwatch
```

# CI/CD environment

Current CI is based on TravisCI which runs npm scripts and publish results on github pages.
In our company we are using gitlab any we can configure CI/CD on gitlab runner with publishing content (player contains only static files) to Amazon S3.