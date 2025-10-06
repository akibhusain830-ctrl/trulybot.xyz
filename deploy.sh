#!/bin/bash

# TrulyBot.xyz Production Deployment Script
set -e

echo "🚀 Starting TrulyBot.xyz deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="trulybot"
IMAGE_TAG=${1:-latest}
REGISTRY=${REGISTRY:-"your-registry.com/trulybot"}

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster. Please check your kubectl configuration."
        exit 1
    fi
    
    log_info "Prerequisites check passed ✅"
}

build_and_push_image() {
    log_info "Building and pushing Docker image..."
    
    # Build the image
    docker build -t ${REGISTRY}:${IMAGE_TAG} .
    
    # Push to registry
    docker push ${REGISTRY}:${IMAGE_TAG}
    
    log_info "Image built and pushed successfully ✅"
}

deploy_secrets() {
    log_info "Deploying secrets..."
    
    if kubectl get secret trulybot-secrets -n ${NAMESPACE} &> /dev/null; then
        log_warn "Secrets already exist. Skipping..."
    else
        log_warn "Please update k8s/secrets.yml with your actual base64 encoded secrets"
        read -p "Have you updated the secrets? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kubectl apply -f k8s/secrets.yml
            log_info "Secrets deployed ✅"
        else
            log_error "Please update secrets before deploying"
            exit 1
        fi
    fi
}

deploy_application() {
    log_info "Deploying application..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    
    # Update image in deployment
    sed -i.bak "s|image: trulybot:latest|image: ${REGISTRY}:${IMAGE_TAG}|g" k8s/deployment.yml
    
    # Apply all configurations
    kubectl apply -f k8s/
    
    # Restore original deployment file
    mv k8s/deployment.yml.bak k8s/deployment.yml
    
    log_info "Application deployed ✅"
}

wait_for_deployment() {
    log_info "Waiting for deployment to be ready..."
    
    kubectl rollout status deployment/trulybot-app -n ${NAMESPACE} --timeout=600s
    
    log_info "Deployment is ready ✅"
}

run_health_check() {
    log_info "Running health checks..."
    
    # Get service endpoint
    EXTERNAL_IP=$(kubectl get svc trulybot-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [ -z "$EXTERNAL_IP" ]; then
        log_warn "External IP not available yet. Using port-forward for health check..."
        kubectl port-forward svc/trulybot-service 8080:80 -n ${NAMESPACE} &
        PORT_FORWARD_PID=$!
        sleep 5
        
        if curl -f http://localhost:8080/api/health &> /dev/null; then
            log_info "Health check passed ✅"
        else
            log_error "Health check failed ❌"
        fi
        
        kill $PORT_FORWARD_PID
    else
        if curl -f http://${EXTERNAL_IP}/api/health &> /dev/null; then
            log_info "Health check passed ✅"
        else
            log_error "Health check failed ❌"
        fi
    fi
}

show_status() {
    log_info "Deployment status:"
    echo
    kubectl get pods -n ${NAMESPACE}
    echo
    kubectl get svc -n ${NAMESPACE}
    echo
    kubectl get ingress -n ${NAMESPACE}
}

cleanup() {
    log_info "Cleaning up..."
    # Kill any background processes
    jobs -p | xargs -r kill
}

# Main deployment flow
main() {
    trap cleanup EXIT
    
    log_info "TrulyBot.xyz Deployment Starting..."
    
    check_prerequisites
    
    # Skip build if NO_BUILD is set
    if [ "$NO_BUILD" != "true" ]; then
        build_and_push_image
    fi
    
    deploy_secrets
    deploy_application
    wait_for_deployment
    run_health_check
    show_status
    
    log_info "🎉 Deployment completed successfully!"
    log_info "Your application should be available at your configured ingress domain"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        log_info "Rolling back to previous version..."
        kubectl rollout undo deployment/trulybot-app -n ${NAMESPACE}
        kubectl rollout status deployment/trulybot-app -n ${NAMESPACE}
        log_info "Rollback completed ✅"
        ;;
    "status")
        show_status
        ;;
    "logs")
        kubectl logs -f deployment/trulybot-app -n ${NAMESPACE}
        ;;
    "scale")
        REPLICAS=${2:-3}
        log_info "Scaling to ${REPLICAS} replicas..."
        kubectl scale deployment/trulybot-app --replicas=${REPLICAS} -n ${NAMESPACE}
        log_info "Scaling completed ✅"
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|status|logs|scale}"
        echo "  deploy     - Deploy the application"
        echo "  rollback   - Rollback to previous version"
        echo "  status     - Show deployment status"
        echo "  logs       - Show application logs"
        echo "  scale [n]  - Scale to n replicas (default: 3)"
        exit 1
        ;;
esac