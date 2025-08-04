// Customer Management AngularJS Application
angular.module('customerApp', [])
.controller('CustomerController', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {
    
    // API Configuration
    const API_BASE_URL = 'http://localhost:3000/api';
    
    // Scope Variables
    $scope.customers = [];
    $scope.pagination = {};
    $scope.performance = {};
    $scope.stats = {};
    $scope.loading = false;
    $scope.error = null;
    
    // Filter and Search Variables
    $scope.searchQuery = '';
    $scope.orderFilter = '';
    $scope.sortBy = 'order_count';
    $scope.itemsPerPage = 20;
    $scope.currentPage = 1;
    
    // Search timeout for debouncing
    let searchTimeout;
    
    // Initialize the application
    $scope.init = function() {
        console.log('🚀 Initializing Customer Management App');
        $scope.loadCustomers();
        $scope.loadStats();
    };
    
    // Load customers with current filters
    $scope.loadCustomers = function(page = 1) {
        $scope.loading = true;
        $scope.error = null;
        $scope.currentPage = page;
        
        // Build query parameters
        let params = {
            page: page,
            limit: $scope.itemsPerPage
        };
        
        // Add order count filters
        if ($scope.orderFilter === '0') {
            params.orderCount = 0;
        } else if ($scope.orderFilter === '1-5') {
            params.minOrders = 1;
            params.maxOrders = 5;
        } else if ($scope.orderFilter === '6-10') {
            params.minOrders = 6;
            params.maxOrders = 10;
        } else if ($scope.orderFilter === '10+') {
            params.minOrders = 10;
        }
        
        // Add search query (we'll implement backend search later)
        if ($scope.searchQuery && $scope.searchQuery.trim()) {
            params.search = $scope.searchQuery.trim();
        }
        
        console.log('📡 Loading customers with params:', params);
        
        $http({
            method: 'GET',
            url: `${API_BASE_URL}/customers-fast`,
            params: params
        }).then(function(response) {
            console.log('✅ Customers loaded successfully:', response.data);
            
            if (response.data.success) {
                $scope.customers = response.data.data.customers;
                $scope.pagination = response.data.data.pagination;
                $scope.performance = response.data.performance;
                
                // Process customers for frontend display
                $scope.processCustomers();
            } else {
                $scope.error = 'Failed to load customers: ' + response.data.message;
            }
            
        }).catch(function(error) {
            console.error('❌ Error loading customers:', error);
            $scope.error = 'Connection error. Please make sure the server is running on port 3000.';
        }).finally(function() {
            $scope.loading = false;
        });
    };
    
    // Process customers for better display
    $scope.processCustomers = function() {
        $scope.customers.forEach(function(customer) {
            // Ensure full_name is available
            if (!customer.full_name) {
                customer.full_name = (customer.first_name + ' ' + customer.last_name).trim();
            }
            
            // Add customer status
            if (customer.order_count === 0) {
                customer.status = 'Prospect';
                customer.statusClass = 'red';
            } else if (customer.order_count <= 5) {
                customer.status = 'New Customer';
                customer.statusClass = 'yellow';
            } else if (customer.order_count <= 15) {
                customer.status = 'Regular Customer';
                customer.statusClass = 'green';
            } else {
                customer.status = 'VIP Customer';
                customer.statusClass = 'purple';
            }
        });
    };
    
    // Load statistics
    $scope.loadStats = function() {
        // We'll calculate stats from the loaded data for now
        // In a real app, you'd have a separate stats endpoint
        $scope.calculateStats();
    };
    
    // Calculate basic stats
    $scope.calculateStats = function() {
        if ($scope.pagination && $scope.pagination.total_customers) {
            $scope.stats = {
                totalCustomers: $scope.pagination.total_customers,
                withOrders: 0, // We'll estimate these
                withoutOrders: 0
            };
            
            // For accurate stats, we'd need separate API calls
            // For now, we'll show what we have
        }
    };
    
    // Search customers with debouncing
    $scope.searchCustomers = function() {
        if (searchTimeout) {
            $timeout.cancel(searchTimeout);
        }
        
        searchTimeout = $timeout(function() {
            console.log('🔍 Searching customers:', $scope.searchQuery);
            $scope.loadCustomers(1); // Reset to first page on search
        }, 500); // 500ms delay
    };
    
    // Apply filters
    $scope.applyFilters = function() {
        console.log('🔧 Applying filters:', $scope.orderFilter);
        $scope.loadCustomers(1);
    };
    
    // Apply sorting (frontend sorting for now)
    $scope.applySorting = function() {
        console.log('📊 Applying sort:', $scope.sortBy);
        
        if ($scope.sortBy === 'order_count') {
            $scope.customers.sort((a, b) => b.order_count - a.order_count);
        } else if ($scope.sortBy === 'name') {
            $scope.customers.sort((a, b) => a.full_name.localeCompare(b.full_name));
        } else if ($scope.sortBy === 'email') {
            $scope.customers.sort((a, b) => a.email.localeCompare(b.email));
        } else if ($scope.sortBy === 'id') {
            $scope.customers.sort((a, b) => a.id - b.id);
        }
    };
    
    // Change page size
    $scope.changePageSize = function() {
        console.log('📏 Changing page size to:', $scope.itemsPerPage);
        $scope.loadCustomers(1);
    };
    
    // Quick filters
    $scope.quickFilter = function(filterType) {
        console.log('⚡ Quick filter:', filterType);
        
        switch(filterType) {
            case 'no-orders':
                $scope.orderFilter = '0';
                break;
            case 'has-orders':
                $scope.orderFilter = '1-5';
                break;
            case 'high-value':
                $scope.orderFilter = '10+';
                break;
        }
        
        $scope.applyFilters();
    };
    
    // Clear all filters
    $scope.clearFilters = function() {
        console.log('🔄 Clearing all filters');
        $scope.searchQuery = '';
        $scope.orderFilter = '';
        $scope.sortBy = 'order_count';
        $scope.loadCustomers(1);
    };
    
    // Pagination functions
    $scope.goToPage = function(page) {
        if (page >= 1 && page <= $scope.pagination.total_pages) {
            console.log('📄 Going to page:', page);
            $scope.loadCustomers(page);
        }
    };
    
    // Get page numbers for pagination
    $scope.getPageNumbers = function() {
        if (!$scope.pagination || !$scope.pagination.total_pages) {
            return [];
        }
        
        const current = $scope.pagination.current_page;
        const total = $scope.pagination.total_pages;
        const pages = [];
        
        // Show max 7 page numbers
        let start = Math.max(1, current - 3);
        let end = Math.min(total, current + 3);
        
        // Adjust if we're near the beginning or end
        if (end - start < 6) {
            if (start === 1) {
                end = Math.min(total, start + 6);
            } else {
                start = Math.max(1, end - 6);
            }
        }
        
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        
        return pages;
    };
    
    // Customer action functions
    $scope.viewCustomerDetails = function(customerId) {
        console.log('👤 Viewing customer details:', customerId);
        // In a real app, this would navigate to customer detail page
        alert(`Viewing details for Customer #${customerId}\n\nThis would open a detailed view with customer information, order history, and analytics.`);
    };
    
    $scope.viewCustomerOrders = function(customerId) {
        console.log('📦 Viewing customer orders:', customerId);
        // In a real app, this would show order history
        alert(`Viewing orders for Customer #${customerId}\n\nThis would show:\n- Order history\n- Purchase patterns\n- Revenue analysis\n- Product preferences`);
    };
    
    $scope.contactCustomer = function(customerId) {
        console.log('📞 Contacting customer:', customerId);
        // In a real app, this would open contact form or integration
        alert(`Contacting Customer #${customerId}\n\nThis would:\n- Open email composer\n- Schedule follow-up\n- Add to marketing campaign\n- Log interaction`);
    };
    
    // Utility function for Math operations in templates
    $scope.Math = Math;
    
    // Initialize the app when controller loads
    $scope.init();
    
    // Auto-refresh every 30 seconds (optional)
    const autoRefresh = setInterval(function() {
        if (!$scope.loading) {
            console.log('🔄 Auto-refreshing data...');
            $scope.loadCustomers($scope.currentPage);
            $scope.$apply();
        }
    }, 30000);
    
    // Cleanup on scope destroy
    $scope.$on('$destroy', function() {
        if (autoRefresh) {
            clearInterval(autoRefresh);
        }
        if (searchTimeout) {
            $timeout.cancel(searchTimeout);
        }
    });
    
}]);
