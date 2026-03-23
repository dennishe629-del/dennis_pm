/**
 * Product Design Configuration Block
 * 
 * 这个扩展会在 Shopify 后台的产品编辑页面添加一个区块，
 * 让商家可以配置衣服上的可编辑设计区域。
 * 
 * Target: admin.product-details.block.render
 */

import React, { useState, useEffect } from 'react';
import {
  reactExtension,
  useApi,
  AdminBlock,
  Button,
  Card,
  InlineStack,
  Text,
  Box,
  Badge,
  Divider,
  Grid,
  TextField,
  Select,
  Checkbox,
  Banner,
  Icon,
  Tooltip,
} from '@shopify/ui-extensions-react/admin';

// 主入口
export default reactExtension(
  'admin.product-details.block.render',
  () => <ProductDesignBlock />
);

function ProductDesignBlock() {
  const { data, extension, navigation } = useApi('admin.product-details.block.render');
  const productId = data.selected?.[0]?.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [designConfig, setDesignConfig] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  
  // 加载产品的设计配置
  useEffect(() => {
    if (!productId) return;
    loadDesignConfig();
  }, [productId]);
  
  const loadDesignConfig = async () => {
    setLoading(true);
    try {
      // 从 Shopify Metafields 加载配置
      const response = await fetch(
        `shopify:admin/api/graphql.json`,
        {
          method: 'POST',
          body: JSON.stringify({
            query: `
              query GetProductMetafields($id: ID!) {
                product(id: $id) {
                  metafield(namespace: "pod_design", key: "configuration") {
                    value
                  }
                }
              }
            `,
            variables: { id: productId }
          })
        }
      );
      
      const result = await response.json();
      const configValue = result.data?.product?.metafield?.value;
      
      if (configValue) {
        setDesignConfig(JSON.parse(configValue));
      } else {
        // 默认配置
        setDesignConfig({
          enabled: false,
          productType: 'tshirt',
          printAreas: [
            {
              id: 'front',
              name: 'Front Chest',
              enabled: true,
              x: 150,
              y: 100,
              width: 200,
              height: 250,
              minDPI: 150,
              allowedTypes: ['image', 'text'],
              maxFileSize: 20 * 1024 * 1024, // 20MB
            }
          ],
          colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF'],
          sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
          customizationFee: 5.00,
        });
      }
    } catch (error) {
      console.error('Failed to load design config:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const saveDesignConfig = async () => {
    setSaving(true);
    try {
      await fetch(
        `shopify:admin/api/graphql.json`,
        {
          method: 'POST',
          body: JSON.stringify({
            query: `
              mutation UpdateProductMetafield($input: ProductInput!) {
                productUpdate(input: $input) {
                  product {
                    id
                  }
                  userErrors {
                    field
                    message
                  }
                }
              }
            `,
            variables: {
              input: {
                id: productId,
                metafields: [
                  {
                    namespace: 'pod_design',
                    key: 'configuration',
                    value: JSON.stringify(designConfig),
                    type: 'json'
                  }
                ]
              }
            }
          })
        }
      );
      
      // 显示成功提示
      showToast('Design configuration saved successfully');
    } catch (error) {
      console.error('Failed to save design config:', error);
      showToast('Failed to save configuration', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const showToast = (message, tone = 'success') => {
    // 使用 Shopify App Bridge 显示 Toast
    // 实际实现中需要使用 app-bridge 的 toast 组件
  };
  
  if (loading) {
    return (
      <AdminBlock title="POD Design Studio">
        <Text>Loading configuration...</Text>
      </AdminBlock>
    );
  }
  
  return (
    <AdminBlock 
      title="POD Design Studio" 
      summary={designConfig?.enabled ? 'Design enabled' : 'Design disabled'}
    >
      <Card>
        {!designConfig?.enabled ? (
          <Box padding="base">
            <Banner tone="info">
              <Text>Enable POD customization to let customers design their own {designConfig?.productType || 'product'}.</Text>
            </Banner>
            <Box paddingTop="base">
              <Button 
                variant="primary" 
                onPress={() => setDesignConfig({ ...designConfig, enabled: true })}
              >
                Enable Design Studio
              </Button>
            </Box>
          </Box>
        ) : (
          <Box padding="base">
            {/* 状态栏 */}
            <InlineStack blockAlign="center" gap="base">
              <Badge tone="success">Active</Badge>
              <Text variant="bodyMd">
                {designConfig.printAreas?.length || 0} print area(s) configured
              </Text>
            </InlineStack>
            
            <Divider />
            
            {/* 快速统计 */}
            <Grid columns={3} gap="base">
              <Box 
                padding="base" 
                background="bg-surface-secondary" 
                borderRadius="base"
              >
                <Text variant="headingSm">{designConfig.printAreas?.length || 0}</Text>
                <Text variant="bodySm" tone="subdued">Print Areas</Text>
              </Box>
              <Box 
                padding="base" 
                background="bg-surface-secondary" 
                borderRadius="base"
              >
                <Text variant="headingSm">{designConfig.colors?.length || 0}</Text>
                <Text variant="bodySm" tone="subdued">Colors</Text>
              </Box>
              <Box 
                padding="base" 
                background="bg-surface-secondary" 
                borderRadius="base"
              >
                <Text variant="headingSm">${designConfig.customizationFee?.toFixed(2) || '0.00'}</Text>
                <Text variant="bodySm" tone="subdued">Extra Fee</Text>
              </Box>
            </Grid>
            
            <Divider />
            
            {/* 操作按钮 */}
            <InlineStack gap="base">
              <Button 
                variant="primary" 
                onPress={() => {
                  // 打开完整编辑器
                  navigation?.navigate?.(
                    `app://pod-design-studio/products/${productId}/edit`
                  );
                }}
              >
                Edit Configuration
              </Button>
              <Button 
                variant="secondary"
                onPress={() => {
                  // 预览设计器
                  window.open(
                    `/proxy/pod-designer/preview?product=${productId}`,
                    '_blank'
                  );
                }}
              >
                Preview
              </Button>
              <Button 
                variant="tertiary"
                tone="critical"
                onPress={() => setDesignConfig({ ...designConfig, enabled: false })}
              >
                Disable
              </Button>
            </InlineStack>
          </Box>
        )}
      </Card>
    </AdminBlock>
  );
}
