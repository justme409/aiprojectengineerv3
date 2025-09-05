-- Seed GLOBAL DEFAULT compliance pack idempotently
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM public.assets WHERE type='compliance_pack' AND (content->>'jurisdiction')='GLOBAL' AND (content->>'version')='1.0.0'
	) THEN
		INSERT INTO public.assets (id, asset_uid, version, is_current, type, subtype, name, organization_id, project_id, status, classification, idempotency_key, metadata, content)
		VALUES (gen_random_uuid(), gen_random_uuid(), 1, true, 'compliance_pack', 'compliance_pack', 'GLOBAL DEFAULT Compliance Pack v1.0.0', (SELECT id FROM public.organizations LIMIT 1), NULL, 'approved', 'internal', 'seed:pack:GLOBAL_DEFAULT_1_0_0', '{}'::jsonb,
		jsonb_build_object('jurisdiction','GLOBAL','agency','ProjectPro','version','1.0.0','required_registers',jsonb_build_array('RMP_minimal'),'ui_modules',jsonb_build_array('quality_module'),'feature_flags_default',jsonb_build_object('quality_module', true))
		);
	END IF;
END$$;
