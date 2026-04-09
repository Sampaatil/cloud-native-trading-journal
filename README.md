# Cloud-Native Trading Journal Platform

A secure serverless trading journal web application built on AWS that allows traders to record, manage, and analyze trade performance in real time.

## Features

- Secure signup/login with AWS Cognito
- JWT-protected API authentication
- Add, edit, update, delete trades
- Monthly trade filtering
- Real-time trade analytics dashboard
- Pie chart accuracy visualization

## AWS Services Used

- AWS Cognito
- API Gateway
- AWS Lambda
- DynamoDB
- Amazon S3

## Project Architecture

Frontend (S3 Hosted Static Website)
→ Cognito Authentication
→ API Gateway JWT Authorizer
→ Lambda Backend
→ DynamoDB Storage

## Folder Structure

architecture/
frontend/
lambda/

## Live Demo

http://trading-journal-project.s3-website-us-east-1.amazonaws.com

## Author

Samarjeet Patil
