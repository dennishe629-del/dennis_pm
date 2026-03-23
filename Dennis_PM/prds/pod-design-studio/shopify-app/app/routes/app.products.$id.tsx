/**
 * 产品设计器页面
 * 商家在这里配置衣服的印刷区域、颜色、尺寸等
 */

import { useState, useEffect, useCallback } from 'react';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useSubmit, useNavigation } from '@remix-run/react';
import {
  Page,
  Layout,
  Card,
  TextField,
  Select,
  Button,
  ButtonGroup,
  InlineStack,
  BlockStack,
  Text,
  Badge,
  Banner,
  Tabs,
  Checkbox,
  RangeSlider,
  Divider,
  DropZone,
  Thumbnail,
  Icon,
  Tooltip,
  Frame,
  Toast,
  Modal,
  ColorPicker,
  hsbToRgb,
  rgbToHsb,
} from '@shopify/polaris';
import {
  ImageMajor,
  TextMajor,
  DeleteMinor,
  PlusMinor,
  DragHandleMinor,
  EditMinor,
  ViewMinor,
  SaveMinor,
} from '@shopify/polaris-icons';
import { authenticate } from '../shopify.server';

// ============================================
// LOADER - 加载产品数据
// ============================================
export async function loader({ request, params }) {
  const { admin, session } = await authenticate.admin(request);
  const { id } = params;
  
  // 获取产品信息
  const productResponse = await admin.graphql(
    `#graphql
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          productType
          tags
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          metafield(namespace: "pod_design", key: "configuration") {
            id
            value
          }
        }
      }
    `,
    { variables: { id: `gid://shopify/Product/${id}` } }
  );
  
  const productData = await productResponse.json();
  const product = productData.data.product;
  
  // 解析设计配置
  let designConfig = null;
  if (product.metafield?.value) {
    try {
      designConfig = JSON.parse(product.metafield.value);
    } catch (e) {
      console.error('Failed to parse design config:', e);
    }
  }
  
  // 默认配置
  if (!designConfig) {
    designConfig = getDefaultConfig(product.productType);
  }
  
  return json({ product, designConfig });
}

// ============================================
// ACTION - 保存设计配置
// ============================================
export async function action({ request, params }) {
  const { admin } = await authenticate.admin(request);
  const { id } = params;
  const formData = await request.formData();
  
  const designConfig = formData.get('designConfig');
  
  // 保存到 Metafield
  await admin.graphql(
    `#graphql
      mutation UpdateProductMetafield($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            metafield(namespace: "pod_design", key: "configuration") {
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        input: {
          id: `gid://shopify/Product/${id}`,
          metafields: [
            {
              namespace: 'pod_design',
              key: 'configuration',
              value: designConfig,
              type: 'json',
            },
          ],
        },
      },
    }
  );
  
  return json({ success: true });
}

// ============================================
// 默认配置
// ============================================
function getDefaultConfig(productType) {
  const configs = {
    tshirt: {
      enabled: true,
      productType: 'tshirt',
      baseWidth: 500,
      baseHeight: 600,
      printAreas: [
        {
          id: 'front',
          name: 'Front Chest',
          enabled: true,
          x: 150,
          y: 80,
          width: 200,
          height: 250,
          minDPI: 150,
          maxFileSize: 20 * 1024 * 1024,
          allowedTypes: ['image', 'text'],
          guidelines: {
            safeZone: { x: 10, y: 10, width: 180, height: 230 },
            bleed: { x: 0, y: 0, width: 200, height: 250 },
          },
        },
        {
          id: 'back',
          name: 'Back',
          enabled: false,
          x: 150,
          y: 80,
          width: 200,
          height: 300,
          minDPI: 150,
          maxFileSize: 20 * 1024 * 1024,
          allowedTypes: ['image', 'text'],
        },
      ],
      colors: [
        { name: 'Black', hex: '#1a1a2e', available: true },
        { name: 'White', hex: '#ffffff', available: true },
        { name: 'Navy', hex: '#1e3a5f', available: true },
        { name: 'Red', hex: '#c41e3a', available: true },
        { name: 'Royal Blue', hex: '#4169e1', available: true },
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
      customizationFee: 5.00,
      minOrderQuantity: 1,
      maxOrderQuantity: 100,
      productionTime: '2-4 days',
    },
    hoodie: {
      enabled: true,
      productType: 'hoodie',
      baseWidth: 550,
      baseHeight: 650,
      printAreas: [
        {
          id: 'front',
          name: 'Front',
          enabled: true,
          x: 175,
          y: 120,
          width: 200,
          height: 280,
          minDPI: 150,
          maxFileSize: 20 * 1024 * 1024,
          allowedTypes: ['image', 'text'],
        },
      ],
      colors: [
        { name: 'Black', hex: '#1a1a2e', available: true },
        { name: 'Gray', hex: '#808080', available: true },
        { name: 'Navy', hex: '#1e3a5f', available: true },
      ],
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      customizationFee: 8.00,
      minOrderQuantity: 1,
      maxOrderQuantity: 50,
      productionTime: '3-5 days',
    },
  };
  
  return configs[productType] || configs.tshirt;
}

// ============================================
// 主组件
// ============================================
export default function ProductDesignEditor() {
  const { product, designConfig: initialConfig } = useLoaderData();
  const submit = useSubmit();
  const navigation = useNavigation();
  
  const [config, setConfig] = useState(initialConfig);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedArea, setSelectedArea] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [toastActive, setToastActive] = useState(false);
  
  const isSaving = navigation.state === 'submitting';
  
  // 保存配置
  const handleSave = useCallback(() => {
    const formData = new FormData();
    formData.append('designConfig', JSON.stringify(config));
    submit(formData, { method: 'post' });
    setToastActive(true);
  }, [config, submit]);
  
  // 更新印刷区域
  const updatePrintArea = (index, updates) => {
    const newAreas = [...config.printAreas];
    newAreas[index] = { ...newAreas[index], ...updates };
    setConfig({ ...config, printAreas: newAreas });
  };
  
  // 添加印刷区域
  const addPrintArea = () => {
    const newArea = {
      id: `area_${Date.now()}`,
      name: `Print Area ${config.printAreas.length + 1}`,
      enabled: true,
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      minDPI: 150,
      maxFileSize: 20 * 1024 * 1024,
      allowedTypes: ['image', 'text'],
    };
    setConfig({
      ...config,
      printAreas: [...config.printAreas, newArea],
    });
    setSelectedArea(config.printAreas.length);
  };
  
  // 删除印刷区域
  const removePrintArea = (index) => {
    const newAreas = config.printAreas.filter((_, i) => i !== index);
    setConfig({ ...config, printAreas: newAreas });
    if (selectedArea >= newAreas.length) {
      setSelectedArea(Math.max(0, newAreas.length - 1));
    }
  };
  
  // Tab 配置
  const tabs = [
    { id: 'general', content: 'General', accessibilityLabel: 'General settings' },
    { id: 'areas', content: 'Print Areas', accessibilityLabel: 'Print area configuration' },
    { id: 'colors', content: 'Colors & Sizes', accessibilityLabel: 'Color and size options' },
    { id: 'pricing', content: 'Pricing', accessibilityLabel: 'Pricing settings' },
  ];
  
  const toastMarkup = toastActive ? (
    <Toast
      content="Configuration saved successfully"
      onDismiss={() => setToastActive(false)}
    />
  ) : null;
  
  return (
    <Frame>
      <Page
        title={`Design Configuration: ${product.title}`}
        titleMetadata={config.enabled ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>}
        backAction={{ content: 'Products', url: '/app/products' }}
        primaryAction={{
          content: 'Save',
          onAction: handleSave,
          loading: isSaving,
          icon: SaveMinor,
        }}
        secondaryActions={[
          {
            content: 'Preview',
            onAction: () => setShowPreview(true),
            icon: ViewMinor,
          },
        ]}
      >
        <Layout>
          <Layout.Section>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
              {/* General Tab */}
              {selectedTab === 0 && (
                <Card>
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h2">General Settings</Text>
                    
                    <Checkbox
                      label="Enable POD Design Studio"
                      checked={config.enabled}
                      onChange={(checked) => setConfig({ ...config, enabled: checked })}
                    />
                    
                    <Select
                      label="Product Type"
                      options={[
                        { label: 'T-Shirt', value: 'tshirt' },
                        { label: 'Hoodie', value: 'hoodie' },
                        { label: 'Tank Top', value: 'tank' },
                        { label: 'Long Sleeve', value: 'longsleeve' },
                      ]}
                      value={config.productType}
                      onChange={(value) => setConfig({ ...config, productType: value })}
                    />
                    
                    <TextField
                      label="Production Time"
                      value={config.productionTime}
                      onChange={(value) => setConfig({ ...config, productionTime: value })}
                      helpText="Estimated time to produce customized items"
                    />
                    
                    <InlineStack gap="400">
                      <TextField
                        type="number"
                        label="Min Order Quantity"
                        value={config.minOrderQuantity}
                        onChange={(value) => setConfig({ ...config, minOrderQuantity: parseInt(value) || 1 })}
                      />
                      <TextField
                        type="number"
                        label="Max Order Quantity"
                        value={config.maxOrderQuantity}
                        onChange={(value) => setConfig({ ...config, maxOrderQuantity: parseInt(value) || 100 })}
                      />
                    </InlineStack>
                  </BlockStack>
                </Card>
              )}
              
              {/* Print Areas Tab */}
              {selectedTab === 1 && (
                <BlockStack gap="400">
                  <Card>
                    <BlockStack gap="400">
                      <InlineStack align="space-between">
                        <Text variant="headingMd" as="h2">Print Areas</Text>
                        <Button icon={PlusMinor} onClick={addPrintArea}>
                          Add Area
                        </Button>
                      </InlineStack>
                      
                      {config.printAreas.map((area, index) => (
                        <Card key={area.id} background="bg-surface-secondary">
                          <BlockStack gap="400">
                            <InlineStack align="space-between">
                              <InlineStack gap="200" blockAlign="center">
                                <Icon source={DragHandleMinor} />
                                <Text variant="headingSm" as="h3">{area.name}</Text>
                                {area.enabled ? (
                                  <Badge tone="success">Enabled</Badge>
                                ) : (
                                  <Badge>Disabled</Badge>
                                )}
                              </InlineStack>
                              <Button
                                icon={DeleteMinor}
                                tone="critical"
                                onClick={() => removePrintArea(index)}
                              />
                            </InlineStack>
                            
                            <Checkbox
                              label="Enable this print area"
                              checked={area.enabled}
                              onChange={(checked) => updatePrintArea(index, { enabled: checked })}
                            />
                            
                            <TextField
                              label="Area Name"
                              value={area.name}
                              onChange={(value) => updatePrintArea(index, { name: value })}
                            />
                            
                            <Text variant="headingXs" as="h4">Position & Size (pixels)</Text>
                            <InlineStack gap="400">
                              <TextField
                                type="number"
                                label="X"
                                value={area.x}
                                onChange={(value) => updatePrintArea(index, { x: parseInt(value) || 0 })}
                              />
                              <TextField
                                type="number"
                                label="Y"
                                value={area.y}
                                onChange={(value) => updatePrintArea(index, { y: parseInt(value) || 0 })}
                              />
                              <TextField
                                type="number"
                                label="Width"
                                value={area.width}
                                onChange={(value) => updatePrintArea(index, { width: parseInt(value) || 100 })}
                              />
                              <TextField
                                type="number"
                                label="Height"
                                value={area.height}
                                onChange={(value) => updatePrintArea(index, { height: parseInt(value) || 100 })}
                              />
                            </InlineStack>
                            
                            <Text variant="headingXs" as="h4">Print Specifications</Text>
                            <InlineStack gap="400">
                              <TextField
                                type="number"
                                label="Min DPI"
                                value={area.minDPI}
                                onChange={(value) => updatePrintArea(index, { minDPI: parseInt(value) || 150 })}
                                helpText="Minimum print resolution"
                              />
                              <TextField
                                type="number"
                                label="Max File Size (MB)"
                                value={(area.maxFileSize / 1024 / 1024).toFixed(0)}
                                onChange={(value) => updatePrintArea(index, { maxFileSize: parseInt(value) * 1024 * 1024 || 20971520 })}
                              />
                            </InlineStack>
                            
                            <Text variant="headingXs" as="h4">Allowed Content Types</Text>
                            <InlineStack gap="400">
                              <Checkbox
                                label="Images"
                                checked={area.allowedTypes.includes('image')}
                                onChange={(checked) => {
                                  const types = checked
                                    ? [...area.allowedTypes, 'image']
                                    : area.allowedTypes.filter((t) => t !== 'image');
                                  updatePrintArea(index, { allowedTypes: types });
                                }}
                              />
                              <Checkbox
                                label="Text"
                                checked={area.allowedTypes.includes('text')}
                                onChange={(checked) => {
                                  const types = checked
                                    ? [...area.allowedTypes, 'text']
                                    : area.allowedTypes.filter((t) => t !== 'text');
                                  updatePrintArea(index, { allowedTypes: types });
                                }}
                              />
                            </InlineStack>
                          </BlockStack>
                        </Card>
                      ))}
                    </BlockStack>
                  </Card>
                  
                  {/* Visual Preview */}
                  <Card>
                    <BlockStack gap="400">
                      <Text variant="headingMd" as="h2">Visual Preview</Text>
                      <div
                        style={{
                          position: 'relative',
                          width: config.baseWidth,
                          height: config.baseHeight,
                          background: '#f5f5f5',
                          border: '1px solid #ddd',
                          margin: '0 auto',
                        }}
                      >
                        {/* Product mockup placeholder */}
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '120px',
                          }}
                        >
                          👕
                        </div>
                        
                        {/* Print areas */}
                        {config.printAreas.map((area) => (
                          area.enabled && (
                            <div
                              key={area.id}
                              style={{
                                position: 'absolute',
                                left: area.x,
                                top: area.y,
                                width: area.width,
                                height: area.height,
                                border: '2px dashed #1976D2',
                                background: 'rgba(25, 118, 210, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                color: '#1976D2',
                              }}
                            >
                              {area.name}
                            </div>
                          )
                        ))}
                      </div>
                    </BlockStack>
                  </Card>
                </BlockStack>
              )}
              
              {/* Colors & Sizes Tab */}
              {selectedTab === 2 && (
                <Card>
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h2">Available Colors</Text>
                    <BlockStack gap="200">
                      {config.colors.map((color, index) => (
                        <InlineStack key={color.name} gap="400" blockAlign="center">
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: color.hex,
                              border: color.hex === '#ffffff' ? '1px solid #ddd' : 'none',
                            }}
                          />
                          <TextField
                            label="Color Name"
                            value={color.name}
                            onChange={(value) => {
                              const newColors = [...config.colors];
                              newColors[index] = { ...color, name: value };
                              setConfig({ ...config, colors: newColors });
                            }}
                          />
                          <TextField
                            label="Hex Code"
                            value={color.hex}
                            onChange={(value) => {
                              const newColors = [...config.colors];
                              newColors[index] = { ...color, hex: value };
                              setConfig({ ...config, colors: newColors });
                            }}
                          />
                          <Checkbox
                            label="Available"
                            checked={color.available}
                            onChange={(checked) => {
                              const newColors = [...config.colors];
                              newColors[index] = { ...color, available: checked };
                              setConfig({ ...config, colors: newColors });
                            }}
                          />
                          <Button
                            icon={DeleteMinor}
                            tone="critical"
                            onClick={() => {
                              const newColors = config.colors.filter((_, i) => i !== index);
                              setConfig({ ...config, colors: newColors });
                            }}
                          />
                        </InlineStack>
                      ))}
                      <Button
                        icon={PlusMinor}
                        onClick={() => {
                          setConfig({
                            ...config,
                            colors: [...config.colors, { name: 'New Color', hex: '#000000', available: true }],
                          });
                        }}
                      >
                        Add Color
                      </Button>
                    </BlockStack>
                    
                    <Divider />
                    
                    <Text variant="headingMd" as="h2">Available Sizes</Text>
                    <InlineStack gap="200" wrap>
                      {config.sizes.map((size, index) => (
                        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Badge size="large">{size}</Badge>
                          <Button
                            icon={DeleteMinor}
                            tone="critical"
                            size="slim"
                            onClick={() => {
                              const newSizes = config.sizes.filter((_, i) => i !== index);
                              setConfig({ ...config, sizes: newSizes });
                            }}
                          />
                        </div>
                      ))}
                    </InlineStack>
                    <InlineStack gap="400">
                      <TextField
                        label="New Size"
                        placeholder="e.g., 4XL"
                        autoComplete="off"
                        connectedRight={
                          <Button onClick={() => {
                            const input = document.querySelector('input[placeholder="e.g., 4XL"]');
                            if (input?.value) {
                              setConfig({ ...config, sizes: [...config.sizes, input.value] });
                              input.value = '';
                            }
                          }}>
                            Add
                          </Button>
                        }
                      />
                    </InlineStack>
                  </BlockStack>
                </Card>
              )}
              
              {/* Pricing Tab */}
              {selectedTab === 3 && (
                <Card>
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h2">Pricing Settings</Text>
                    
                    <TextField
                      type="number"
                      label="Customization Fee"
                      prefix="$"
                      value={config.customizationFee}
                      onChange={(value) => setConfig({ ...config, customizationFee: parseFloat(value) || 0 })}
                      helpText="Additional fee charged for custom designs"
                    />
                    
                    <Banner tone="info">
                      <BlockStack gap="200">
                        <Text variant="headingSm">Pricing Formula</Text>
                        <Text as="p">
                          Final Price = Base Product Price + Customization Fee
                        </Text>
                        <Text as="p">
                          Example: If base price is $24.99 and customization fee is $5.00,
                          customer will pay $29.99
                        </Text>
                      </BlockStack>
                    </Banner>
                  </BlockStack>
                </Card>
              )}
            </Tabs>
          </Layout.Section>
          
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Quick Actions</Text>
                
                <Button
                  fullWidth
                  icon={ViewMinor}
                  onClick={() => setShowPreview(true)}
                >
                  Preview Design Studio
                </Button>
                
                <Button
                  fullWidth
                  icon={EditMinor}
                  url={`/app/products/${product.id.split('/').pop()}`}
                >
                  Edit Product
                </Button>
                
                <Divider />
                
                <Text variant="headingSm" as="h3">Configuration Summary</Text>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text tone="subdued">Status</Text>
                    {config.enabled ? (
                      <Badge tone="success">Active</Badge>
                    ) : (
                      <Badge>Inactive</Badge>
                    )}
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text tone="subdued">Print Areas</Text>
                    <Text>{config.printAreas.filter((a) => a.enabled).length} / {config.printAreas.length}</Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text tone="subdued">Colors</Text>
                    <Text>{config.colors.filter((c) => c.available).length}</Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text tone="subdued">Sizes</Text>
                    <Text>{config.sizes.length}</Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text tone="subdued">Extra Fee</Text>
                    <Text>${config.customizationFee.toFixed(2)}</Text>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
        
        {/* Preview Modal */}
        <Modal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          title="Design Studio Preview"
          large
        >
          <Modal.Section>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>This is where the customer-facing design studio would appear.</p>
              <p>Product: {product.title}</p>
              <div style={{ marginTop: '20px', padding: '40px', background: '#f5f5f5', borderRadius: '8px' }}>
                <span style={{ fontSize: '100px' }}>👕</span>
                <p style={{ marginTop: '20px' }}>Interactive Design Canvas would be here</p>
              </div>
            </div>
          </Modal.Section>
        </Modal>
        
        {toastMarkup}
      </Page>
    </Frame>
  );
}
