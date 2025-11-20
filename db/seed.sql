-- -- =====================================================
-- -- Seed Data for Asistify Backend
-- -- =====================================================

-- Clean existing data
DELETE FROM metric;
DELETE FROM receptionist;
DELETE FROM enterprise;
DELETE FROM enterprise_category;

-- =====================================================
-- Enterprise Categories
-- =====================================================
INSERT INTO enterprise_category (id, name, description, created_at, updated_at)
VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Healthcare', 'Medical clinics, hospitals, and healthcare providers', NOW(), NOW()),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Dental', 'Dental clinics and orthodontic practices', NOW(), NOW()),
  ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'Beauty & Wellness', 'Salons, spas, and beauty centers', NOW(), NOW()),
  ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'Fitness', 'Gyms, yoga studios, and fitness centers', NOW(), NOW()),
  ('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'Legal Services', 'Law firms and legal consultation services', NOW(), NOW());

-- =====================================================
-- Enterprises
-- =====================================================
INSERT INTO enterprise (id, name, category_id, created_at, updated_at)
VALUES
  ('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 'HealthPlus Medical Center', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', NOW(), NOW()),
  ('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 'Bright Smile Dental Clinic', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', NOW(), NOW()),
  ('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 'Serenity Spa & Wellness', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', NOW(), NOW()),
  ('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'FitLife Gym', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', NOW(), NOW()),
  ('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 'Downtown Legal Associates', 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', NOW(), NOW()),
  ('e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 'PrimeCare Medical Group', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', NOW(), NOW()),
  ('f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', 'Radiant Beauty Salon', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', NOW(), NOW()),
  ('a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d', 'Elite Fitness Center', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', NOW(), NOW()),
  ('b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e', 'Family Dental Care', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', NOW(), NOW()),
  ('c5d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9f', 'Martinez Law Firm', 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', NOW(), NOW());

-- =====================================================
-- Avatars (10 entries)
-- =====================================================
INSERT INTO avatar (id, url, created_at, updated_at)
VALUES
  ('d6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia', NOW(), NOW()),
  ('e7f8a9b0-c1d2-4e3f-4a5b-6c7d8e9f0a1b', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus', NOW(), NOW()),
  ('f8a9b0c1-d2e3-4f4a-5b6c-7d8e9f0a1b2c', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella', NOW(), NOW()),
  ('a9b0c1d2-e3f4-4a5b-6c7d-8e9f0a1b2c3d', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', NOW(), NOW()),
  ('b0c1d2e3-f4a5-4b6c-7d8e-9f0a1b2c3d4e', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Victoria', NOW(), NOW()),
  ('c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna', NOW(), NOW()),
  ('d2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia', NOW(), NOW()),
  ('e3f4a5b6-c7d8-4e9f-0a1b-2c3d4e5f6a7b', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan', NOW(), NOW()),
  ('f4a5b6c7-d8e9-4f0a-1b2c-3d4e5f6a7b8c', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia', NOW(), NOW()),
  ('a5b6c7d8-e9f0-4a1b-2c3d-4e5f6a7b8c9d', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', NOW(), NOW());

-- =====================================================
-- Receptionists (10 entries)
-- =====================================================
INSERT INTO receptionist (id, name, avatar_id, cellphone, enterprise_information, client_information, business_restrictions, level_formality, level_dynamism, anticipation_max_days, anticipation_min_days, enterprise_id, created_at, updated_at)
VALUES
  (
    'b6c7d8e9-f0a1-4b2c-3d4e-5f6a7b8c9d0e',
    'Sofia',
    'd6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a',
    '+1-555-0101',
    'HealthPlus Medical Center specializes in family medicine, pediatrics, and preventive care. We have 5 doctors available and operate Monday-Friday 8AM-6PM, Saturday 9AM-2PM.',
    'New patients need insurance information and ID. Returning patients should mention their patient ID for faster service.',
    'No appointments on Sundays. Emergency cases should call 911. Cancellations require 24-hour notice.',
    8,
    5,
    30,
    1,
    'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c',
    NOW(),
    NOW()
  ),
  (
    'c7d8e9f0-a1b2-4c3d-4e5f-6a7b8c9d0e1f',
    'Marcus',
    'e7f8a9b0-c1d2-4e3f-4a5b-6c7d8e9f0a1b',
    '+1-555-0102',
    'Bright Smile Dental offers general dentistry, cosmetic procedures, and orthodontics. We accept most insurance plans and offer flexible payment options.',
    'Please arrive 15 minutes early for paperwork. Bring your insurance card and a list of current medications.',
    'No walk-ins accepted. Children under 16 must be accompanied by a parent. Late arrivals may need to reschedule.',
    7,
    6,
    45,
    2,
    'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d',
    NOW(),
    NOW()
  ),
  (
    'd8e9f0a1-b2c3-4d4e-5f6a-7b8c9d0e1f2a',
    'Isabella',
    'f8a9b0c1-d2e3-4f4a-5b6c-7d8e9f0a1b2c',
    '+1-555-0103',
    'Serenity Spa offers massage therapy, facials, body treatments, and wellness packages. Gift certificates available. Open 7 days a week 10AM-8PM.',
    'First-time clients receive a 20% discount. Please arrive 10 minutes early to fill out health history forms.',
    'Late cancellations (less than 4 hours notice) will be charged 50%. Please remove jewelry before treatments.',
    5,
    8,
    60,
    1,
    'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e',
    NOW(),
    NOW()
  ),
  (
    'e9f0a1b2-c3d4-4e5f-6a7b-8c9d0e1f2a3b',
    'Alex',
    'a9b0c1d2-e3f4-4a5b-6c7d-8e9f0a1b2c3d',
    '+1-555-0104',
    'FitLife Gym features state-of-the-art equipment, group classes, personal training, and a juice bar. Open 24/7 for members.',
    'Membership required for access. Guests can book a free trial session. Personal training sessions can be scheduled in advance.',
    'Proper gym attire required. No outside food or drinks except water. Classes have limited capacity.',
    4,
    9,
    14,
    1,
    'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f',
    NOW(),
    NOW()
  ),
  (
    'f0a1b2c3-d4e5-4f6a-7b8c-9d0e1f2a3b4c',
    'Victoria',
    'b0c1d2e3-f4a5-4b6c-7d8e-9f0a1b2c3d4e',
    '+1-555-0105',
    'Downtown Legal Associates provides consultation in family law, real estate, and business law. Free 30-minute initial consultation available.',
    'Please bring all relevant documents to your appointment. Retainer agreements required for ongoing representation.',
    'Consultations by appointment only. Payment due at time of service. Attorney-client privilege applies to all communications.',
    9,
    3,
    21,
    3,
    'd0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a',
    NOW(),
    NOW()
  ),
  (
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5e',
    'Luna',
    'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f',
    '+1-555-0106',
    'PrimeCare Medical Group offers primary care, urgent care, and telemedicine services. We have specialists in cardiology, dermatology, and internal medicine.',
    'We accept all major insurance providers. Same-day appointments available for urgent matters. Telemedicine consultations can be scheduled online.',
    'Video appointments require a stable internet connection. Prescriptions will be sent to your preferred pharmacy. Follow-up appointments recommended every 6 months.',
    7,
    6,
    28,
    1,
    'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b',
    NOW(),
    NOW()
  ),
  (
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6f',
    'Mia',
    'd2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a',
    '+1-555-0107',
    'Radiant Beauty Salon specializes in hair styling, coloring, nail services, and makeup. We use organic and cruelty-free products.',
    'Consultation is free for all services. Please specify any allergies or sensitivities. Loyalty program available for regular clients.',
    'Cancellations must be made 24 hours in advance. Color services require a patch test 48 hours prior. No refunds, only rescheduling.',
    6,
    7,
    30,
    2,
    'f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c',
    NOW(),
    NOW()
  ),
  (
    'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7a',
    'Ethan',
    'e3f4a5b6-c7d8-4e9f-0a1b-2c3d4e5f6a7b',
    '+1-555-0108',
    'Elite Fitness Center offers CrossFit training, Olympic weightlifting, and nutrition coaching. Small group classes and one-on-one coaching available.',
    'Beginners welcome! All fitness levels accommodated. Bring a water bottle and towel. First class is free for new members.',
    'Athletes must sign a waiver. Proper athletic shoes required. No chalk allowed in certain areas. Maximum class size is 12 people.',
    5,
    8,
    10,
    1,
    'a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d',
    NOW(),
    NOW()
  ),
  (
    'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8b',
    'Olivia',
    'f4a5b6c7-d8e9-4f0a-1b2c-3d4e5f6a7b8c',
    '+1-555-0109',
    'Family Dental Care provides comprehensive dental services for all ages. We specialize in pediatric dentistry and offer sedation options for anxious patients.',
    'Children receive a toy after each visit. Parents can stay in the room during treatment. We accept CareCredit and offer payment plans.',
    'Appointments for children under 5 are scheduled for morning hours only. Emergency dental services available during business hours.',
    8,
    5,
    35,
    2,
    'b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e',
    NOW(),
    NOW()
  ),
  (
    'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9c',
    'James',
    'a5b6c7d8-e9f0-4a1b-2c3d-4e5f6a7b8c9d',
    '+1-555-0110',
    'Martinez Law Firm specializes in immigration law, personal injury, and criminal defense. Multilingual staff available. Payment plans accepted.',
    'Confidentiality guaranteed. Bring government-issued ID and any relevant legal documents. Virtual consultations available for out-of-state clients.',
    'All consultations are confidential and protected by attorney-client privilege. Retainer required before case work begins. Court appearances require 48-hour notice.',
    9,
    4,
    15,
    2,
    'c5d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9f',
    NOW(),
    NOW()
  );

-- =====================================================
-- Metrics (Sample data for receptionists)
-- =====================================================
INSERT INTO metric (id, model_used, token_usage, response_time, receptionist_id, created_at, updated_at)
VALUES
  ('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0d', 'gpt-4o', 450, 1.2, 'b6c7d8e9-f0a1-4b2c-3d4e-5f6a7b8c9d0e', NOW(), NOW()),
  ('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1e', 'gpt-4o', 380, 1.1, 'b6c7d8e9-f0a1-4b2c-3d4e-5f6a7b8c9d0e', NOW(), NOW()),
  ('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2f', 'gpt-4o-mini', 280, 0.8, 'c7d8e9f0-a1b2-4c3d-4e5f-6a7b8c9d0e1f', NOW(), NOW()),
  ('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3a', 'gpt-4o', 520, 1.5, 'd8e9f0a1-b2c3-4d4e-5f6a-7b8c9d0e1f2a', NOW(), NOW()),
  ('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4b', 'gpt-4o-mini', 310, 0.9, 'e9f0a1b2-c3d4-4e5f-6a7b-8c9d0e1f2a3b', NOW(), NOW()),
  ('e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5c', 'gpt-4o', 490, 1.3, 'f0a1b2c3-d4e5-4f6a-7b8c-9d0e1f2a3b4c', NOW(), NOW()),
  ('f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6d', 'gpt-4o', 420, 1.2, 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5e', NOW(), NOW()),
  ('a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7e', 'gpt-4o-mini', 295, 0.7, 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6f', NOW(), NOW()),
  ('b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8f', 'gpt-4o', 510, 1.4, 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7a', NOW(), NOW()),
  ('c5d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9a', 'gpt-4o', 460, 1.3, 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8b', NOW(), NOW()),
  ('d6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0b', 'gpt-4o', 475, 1.2, 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9c', NOW(), NOW());


INSERT INTO document_type (id, name, created_at, updated_at) 
VALUES
  ('4fc9ff43-cfb7-4b3f-a1b2-01eeab4c7a29', 'General', NOW(), NOW()),
  ('d01d9195-875a-496e-a427-b97e28b66317', 'Specific', NOW(), NOW()),
  ('57d132bc-6c4a-48f2-9938-00c2d627af6a', 'Normative', NOW(), NOW());


-- =====================================================
-- Roles
-- =====================================================
INSERT INTO role (id, name, description, created_at, updated_at) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Admin', 'Administrator with full access', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Enterprise Owner', 'Owner of an enterprise account', NOW(), NOW());

-- -- =====================================================
-- -- Chunk Types
-- -- =====================================================
INSERT INTO document_chunk_type (id, name, created_at, updated_at) 
VALUES 
  ('6e199a75-67d8-4dfd-bbbe-5491e5c9faf2', 'General', NOW(), NOW());