-- ====================================================================
-- Task 70: Missing Tables for Data Seeding System
-- Creates ml_models and products tables needed for complete integration
-- ====================================================================

-- 1. ML_MODELS table for machine learning model management
CREATE TABLE IF NOT EXISTS ml_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'content_optimization', 'engagement_prediction', 'sentiment_analysis', etc.
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    status VARCHAR(50) NOT NULL DEFAULT 'training', -- 'training', 'active', 'deprecated', 'testing'
    accuracy_score DECIMAL(5,4), -- 0.0000 to 1.0000
    training_data_size INTEGER,
    model_parameters JSONB, -- Store model config, hyperparameters, etc.
    performance_metrics JSONB, -- precision, recall, f1_score, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trained_at TIMESTAMP WITH TIME ZONE,
    deployed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    tags TEXT[] DEFAULT '{}',
    description TEXT,
    model_file_path TEXT, -- Path to stored model file
    training_config JSONB, -- Training configuration used
    validation_results JSONB -- Cross-validation and test results
);

-- 2. PRODUCTS table for product catalog management
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    description TEXT,
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'discontinued'
    inventory_count INTEGER DEFAULT 0,
    metadata JSONB, -- Flexible product attributes
    images TEXT[], -- Array of image URLs
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    brand VARCHAR(100),
    model VARCHAR(100),
    weight DECIMAL(8,3), -- in kg
    dimensions JSONB, -- {"length": 10, "width": 5, "height": 3, "unit": "cm"}
    rating DECIMAL(3,2), -- Average rating 0.00 to 5.00
    review_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    seo_title VARCHAR(255),
    seo_description TEXT,
    external_id VARCHAR(255) -- For integration with external systems
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ml_models_type ON ml_models(type);
CREATE INDEX IF NOT EXISTS idx_ml_models_status ON ml_models(status);
CREATE INDEX IF NOT EXISTS idx_ml_models_created_at ON ml_models(created_at);
CREATE INDEX IF NOT EXISTS idx_ml_models_accuracy ON ml_models(accuracy_score DESC);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- 4. RLS Policies
ALTER TABLE ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ML Models policies
CREATE POLICY "Users can view ml_models" ON ml_models FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert ml_models" ON ml_models FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own ml_models" ON ml_models FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Users can delete own ml_models" ON ml_models FOR DELETE USING (created_by = auth.uid());

-- Products policies  
CREATE POLICY "Users can view active products" ON products FOR SELECT USING (status = 'active' OR auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own products" ON products FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Users can delete own products" ON products FOR DELETE USING (created_by = auth.uid());

-- 5. Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ml_models_updated_at BEFORE UPDATE ON ml_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Sample data for ml_models
INSERT INTO ml_models (name, type, status, accuracy_score, description, model_parameters, performance_metrics) VALUES
('Content Engagement Predictor v1.0', 'engagement_prediction', 'active', 0.8420, 'Predicts user engagement based on content features and historical data', 
 '{"algorithm": "random_forest", "n_estimators": 100, "max_depth": 15, "features": ["title_length", "image_count", "posting_time", "hashtag_count"]}',
 '{"precision": 0.84, "recall": 0.81, "f1_score": 0.82, "auc_roc": 0.89}'),

('Content Topic Classifier v2.1', 'content_classification', 'active', 0.9150, 'Automatically categorizes content into topics and themes',
 '{"algorithm": "bert_classifier", "model_size": "base", "fine_tuned": true, "vocab_size": 30000}',
 '{"accuracy": 0.915, "macro_f1": 0.91, "weighted_f1": 0.92, "confusion_matrix": "stored_separately"}'),

('Sentiment Analysis Engine v1.5', 'sentiment_analysis', 'active', 0.8890, 'Analyzes sentiment of content and user comments',
 '{"algorithm": "transformer", "model_type": "distilbert", "languages": ["en", "nl"], "confidence_threshold": 0.7}',
 '{"positive_precision": 0.89, "negative_precision": 0.87, "neutral_precision": 0.91, "overall_accuracy": 0.889}');

-- 7. Sample data for products  
INSERT INTO products (name, sku, category, description, price, currency, status, metadata, tags, brand, rating, review_count, featured) VALUES
('Premium Content Creation Suite', 'PCS-001', 'Software', 'Complete content creation and management platform with AI assistance', 299.99, 'USD', 'active',
 '{"license_type": "annual", "max_users": 10, "features": ["ai_writing", "content_calendar", "analytics"], "support_level": "premium"}',
 '{"content", "ai", "marketing", "premium"}', 'ContentCorp', 4.8, 127, true),

('Social Media Analytics Pro', 'SMA-PRO-002', 'Analytics', 'Advanced social media monitoring and analytics platform', 149.99, 'USD', 'active',
 '{"platforms": ["facebook", "instagram", "twitter", "linkedin"], "data_retention": "2_years", "api_access": true}',
 '{"social", "analytics", "monitoring", "professional"}', 'AnalyticsCorp', 4.6, 89, true),

('Content Automation Toolkit', 'CAT-003', 'Automation', 'Automated content distribution and scheduling tools', 99.99, 'USD', 'active',
 '{"scheduling": true, "multi_platform": true, "bulk_operations": true, "api_integrations": 15}',
 '{"automation", "scheduling", "efficiency", "tools"}', 'AutomateCorp', 4.4, 56, false),

('AI Writing Assistant Pro', 'AWA-PRO-004', 'AI Tools', 'Advanced AI-powered writing and content optimization', 199.99, 'USD', 'active',
 '{"ai_models": ["gpt-4", "claude", "custom"], "languages": 12, "tone_options": 8, "plagiarism_check": true}',
 '{"ai", "writing", "optimization", "professional"}', 'AIWriteCorp', 4.9, 203, true);

-- 8. Views for easy data access
CREATE OR REPLACE VIEW active_ml_models AS
SELECT 
    id,
    name,
    type,
    version,
    accuracy_score,
    created_at,
    deployed_at,
    description,
    tags
FROM ml_models 
WHERE status = 'active'
ORDER BY accuracy_score DESC;

CREATE OR REPLACE VIEW product_catalog AS
SELECT 
    id,
    name,
    sku,
    category,
    description,
    price,
    currency,
    rating,
    review_count,
    featured,
    created_at,
    tags
FROM products 
WHERE status = 'active'
ORDER BY featured DESC, rating DESC, created_at DESC;

-- 9. Functions for data seeding support
CREATE OR REPLACE FUNCTION get_random_ml_model(model_type TEXT DEFAULT NULL)
RETURNS TABLE(id UUID, name VARCHAR, type VARCHAR, accuracy_score DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.name, m.type, m.accuracy_score
    FROM ml_models m
    WHERE (model_type IS NULL OR m.type = model_type)
    AND m.status = 'active'
    ORDER BY RANDOM()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_random_product(category_filter TEXT DEFAULT NULL)
RETURNS TABLE(id UUID, name VARCHAR, sku VARCHAR, price DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.sku, p.price
    FROM products p
    WHERE (category_filter IS NULL OR p.category = category_filter)
    AND p.status = 'active'
    ORDER BY RANDOM()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'SUCCESS: ml_models and products tables created with sample data!' as result; 