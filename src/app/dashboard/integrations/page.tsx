'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { 
  ShoppingBagIcon, 
  CubeIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  PlusIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

interface Integration {
  id: string;
  platform: 'woocommerce' | 'shopify';
  store_name: string;
  store_url: string;
  store_email?: string;
  shop_domain?: string;
  status: 'active' | 'disconnected' | 'error';
  currency: string;
  plan?: string;
  connected_at: string;
  last_sync_at?: string;
}

interface IntegrationStats {
  total_integrations: number;
  active_integrations: number;
  woocommerce_stores: number;
  shopify_stores: number;
}

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [stats, setStats] = useState<IntegrationStats>({
    total_integrations: 0,
    active_integrations: 0,
    woocommerce_stores: 0,
    shopify_stores: 0
  });
  const [loading, setLoading] = useState(true);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('User ID copied to clipboard!');
  };

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations');
      const data = await response.json();
      
      if (data.success) {
        setIntegrations(data.integrations);
        setStats(data.stats);
      } else {
        toast.error('Failed to load integrations');
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (integrationId: string, storeName: string) => {
    if (!confirm(`Are you sure you want to disconnect "${storeName}"?\n\nThis will:\n• Disable the chatbot on that store\n• Allow you to connect a different store\n\nYou can always reconnect this store later.`)) {
      return;
    }

    setDisconnectingId(integrationId);
    
    try {
      const response = await fetch(`/api/integrations?id=${integrationId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Store disconnected successfully');
        fetchIntegrations(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to disconnect store');
      }
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      toast.error('Failed to disconnect store');
    } finally {
      setDisconnectingId(null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'woocommerce':
        return <ShoppingBagIcon className="w-6 h-6" />;
      case 'shopify':
        return <CubeIcon className="w-6 h-6" />;
      default:
        return <ShoppingBagIcon className="w-6 h-6" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'woocommerce':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'shopify':
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700/50 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-800/50 h-24 rounded-xl border border-gray-700/50"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-800/50 h-32 rounded-xl border border-gray-700/50"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Store Integrations</h1>
        <p className="text-gray-400">
          Connect your e-commerce stores to enable TrulyBot chatbot with order tracking capabilities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/50"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <ShoppingBagIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Stores</p>
              <p className="text-2xl font-bold text-white">{stats.total_integrations}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/50"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Active</p>
              <p className="text-2xl font-bold text-white">{stats.active_integrations}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/50"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <ShoppingBagIcon className="w-6 h-6 text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">WooCommerce</p>
              <p className="text-2xl font-bold text-white">{stats.woocommerce_stores}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/30 opacity-75"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
              <CubeIcon className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Shopify</p>
              <p className="text-lg font-bold text-yellow-400">Coming Soon</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* User ID Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-blue-500/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Your TrulyBot User ID</h2>
            <p className="text-gray-400 mb-4">
              Use this ID when connecting your stores to TrulyBot. Keep it private and only use for stores you own.
            </p>
            <div className="flex items-center gap-3">
              <div className="bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 font-mono text-blue-400 text-sm flex-1">
                {user?.id || 'Loading...'}
              </div>
              <button
                onClick={() => user?.id && copyToClipboard(user.id)}
                className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={!user?.id}
              >
                <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                Copy
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Integration Setup Cards */}
      {stats.active_integrations > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-amber-500/30"
        >
          <div className="flex items-start gap-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-2">Store Connection Limit</h3>
              <p className="text-amber-200 mb-3">
                You can only connect <strong>one store per account</strong>. You currently have{' '}
                <strong>{stats.active_integrations}</strong> store{stats.active_integrations > 1 ? 's' : ''} connected.
              </p>
              <p className="text-amber-300 text-sm">
                To connect a different store, you must first disconnect your current store using the trash icon in the "Connected Stores" section below.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-sm rounded-xl p-6 shadow-lg border ${
            stats.active_integrations > 0 
              ? 'bg-gray-900/30 border-gray-700/30 opacity-60' 
              : 'bg-gray-900/50 border-gray-700/50'
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <ShoppingBagIcon className="w-8 h-8 text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-white">WooCommerce</h3>
              <p className="text-sm text-gray-400">WordPress/WooCommerce stores</p>
            </div>
          </div>
          <p className="text-gray-300 mb-4">
            Install our WordPress plugin to connect your WooCommerce store and enable order tracking through the chatbot.
          </p>
          {stats.active_integrations > 0 ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
              <p className="text-amber-300 text-sm">
                You already have a store connected. Disconnect your current store first to connect a WooCommerce store.
              </p>
            </div>
          ) : null}
          <div className="flex gap-3">
            <a
              href="/integrations/woocommerce/trulybot-woocommerce.zip"
              download
              className={`flex items-center px-4 py-2 rounded-lg transition-colors shadow-lg ${
                stats.active_integrations > 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
              onClick={stats.active_integrations > 0 ? (e) => e.preventDefault() : undefined}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              {stats.active_integrations > 0 ? 'Limit Reached' : 'Download Plugin'}
            </a>
            <Link
              href="/integrations/woocommerce/setup"
              className="flex items-center px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              Setup Guide
              <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`backdrop-blur-sm rounded-xl p-6 shadow-lg border ${
            stats.active_integrations > 0 
              ? 'bg-gray-900/20 border-gray-700/20 opacity-50' 
              : 'bg-gray-900/30 border-gray-700/30 opacity-75'
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
              <CubeIcon className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-white">Shopify</h3>
              <p className="text-sm text-gray-400">Shopify stores - Coming Soon</p>
            </div>
          </div>
          <p className="text-gray-300 mb-4">
            Our Shopify app is coming soon! We're working hard to bring you seamless AI-powered customer support with order tracking for Shopify stores.
          </p>
          {stats.active_integrations > 0 ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
              <p className="text-amber-300 text-sm">
                You already have a store connected. When Shopify becomes available, disconnect your current store first.
              </p>
            </div>
          ) : null}
          <div className="flex gap-3">
            <button
              disabled
              className="flex items-center px-4 py-2 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed shadow-lg opacity-60"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Coming Soon
            </button>
            <button
              disabled
              className="flex items-center px-4 py-2 border border-gray-700 text-gray-500 rounded-lg cursor-not-allowed opacity-60"
            >
              Setup Guide
              <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Connected Stores */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700/50">
        <div className="p-6 border-b border-gray-700/50">
          <h2 className="text-xl font-semibold text-white">Manage Your Store</h2>
          <p className="text-gray-400 mt-1">
            {integrations.length > 0 
              ? 'Manage your connected store (1 store limit per account)'
              : 'Connect your first e-commerce store'
            }
          </p>
        </div>

        <div className="p-6">
          {integrations.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBagIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No store connected</h3>
              <p className="text-gray-400 mb-6">
                Connect your first store to enable TrulyBot chatbot with order tracking. You can connect one store per account.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {integrations.map((integration, index) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${getPlatformColor(integration.platform)}`}>
                      {getPlatformIcon(integration.platform)}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-white">
                          {integration.store_name}
                        </h3>
                        <div className="ml-2">
                          {getStatusIcon(integration.status)}
                        </div>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          integration.status === 'active' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : integration.status === 'error'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {integration.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        <p>{integration.store_url}</p>
                        <p>Connected: {formatDate(integration.connected_at)}</p>
                        {integration.last_sync_at && (
                          <p>Last sync: {formatDate(integration.last_sync_at)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-300">
                      {integration.currency}
                    </span>
                    <a
                      href={integration.store_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                      title="Visit store"
                    >
                      <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleDisconnect(integration.id, integration.store_name)}
                      disabled={disconnectingId === integration.id}
                      className="flex items-center px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 border border-red-500/30"
                      title="Disconnect store to connect a different one"
                    >
                      {disconnectingId === integration.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <TrashIcon className="w-4 h-4 mr-2" />
                      )}
                      <span className="text-sm font-medium">
                        {disconnectingId === integration.id ? 'Disconnecting...' : 'Disconnect'}
                      </span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}