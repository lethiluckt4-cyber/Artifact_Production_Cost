--
-- PostgreSQL database dump
--

\restrict IT5WsfPzpeujXeLoAtT5KXbA24zQPBEiKmsuNRbFbW57Cxh5c2rI5AuBPSKB7We

-- Dumped from database version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: giathanh; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA giathanh;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: giathanh; Owner: -
--

CREATE FUNCTION giathanh.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bom_line; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.bom_line (
    id bigint NOT NULL,
    company_id bigint NOT NULL,
    bom_type text DEFAULT 'DM'::text NOT NULL,
    product_code text NOT NULL,
    material_code text NOT NULL,
    product_qty numeric(18,4) DEFAULT 0 NOT NULL,
    material_qty numeric(18,6) DEFAULT 0 NOT NULL,
    runs_per_day numeric(18,4) DEFAULT 0 NOT NULL,
    loss_pct numeric(18,6) DEFAULT 0 NOT NULL,
    substitute_code text,
    valid_from date,
    valid_to date,
    substitute_ratio numeric(9,6) DEFAULT 0 NOT NULL,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT bom_line_check CHECK (((valid_to IS NULL) OR (valid_from IS NULL) OR (valid_to >= valid_from)))
);


--
-- Name: bom_line_id_seq; Type: SEQUENCE; Schema: giathanh; Owner: -
--

CREATE SEQUENCE giathanh.bom_line_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bom_line_id_seq; Type: SEQUENCE OWNED BY; Schema: giathanh; Owner: -
--

ALTER SEQUENCE giathanh.bom_line_id_seq OWNED BY giathanh.bom_line.id;


--
-- Name: common_issue; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.common_issue (
    id bigint NOT NULL,
    company_id bigint NOT NULL,
    voucher_no text,
    issue_date date NOT NULL,
    item_code text NOT NULL,
    qty numeric(18,4) DEFAULT 0 NOT NULL,
    issue_type text NOT NULL,
    reason text,
    CONSTRAINT common_issue_issue_type_check CHECK ((issue_type = ANY (ARRAY['627'::text, '641'::text])))
);


--
-- Name: common_issue_id_seq; Type: SEQUENCE; Schema: giathanh; Owner: -
--

CREATE SEQUENCE giathanh.common_issue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: common_issue_id_seq; Type: SEQUENCE OWNED BY; Schema: giathanh; Owner: -
--

ALTER SEQUENCE giathanh.common_issue_id_seq OWNED BY giathanh.common_issue.id;


--
-- Name: company; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.company (
    id bigint NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: company_id_seq; Type: SEQUENCE; Schema: giathanh; Owner: -
--

CREATE SEQUENCE giathanh.company_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: company_id_seq; Type: SEQUENCE OWNED BY; Schema: giathanh; Owner: -
--

ALTER SEQUENCE giathanh.company_id_seq OWNED BY giathanh.company.id;


--
-- Name: company_setting; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.company_setting (
    company_id bigint NOT NULL,
    start_period character(7),
    work_year smallint,
    sunday_off boolean DEFAULT true NOT NULL,
    alloc_basis_622 text DEFAULT 'kg'::text NOT NULL,
    alloc_basis_627 text DEFAULT 'kg'::text NOT NULL,
    stale_days numeric(10,2),
    reserve_days numeric(10,2),
    ignore_days numeric(10,2),
    misa_partner_code text,
    misa_partner_name text,
    misa_debit_issue text,
    misa_credit_recv text,
    holidays_2026_seeded boolean DEFAULT false NOT NULL,
    extra jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT company_setting_alloc_basis_622_check CHECK ((alloc_basis_622 = ANY (ARRAY['kg'::text, 'nvl'::text]))),
    CONSTRAINT company_setting_alloc_basis_627_check CHECK ((alloc_basis_627 = ANY (ARRAY['kg'::text, 'nvl'::text]))),
    CONSTRAINT company_setting_start_period_check CHECK ((start_period ~ '^\d{4}-\d{2}$'::text))
);


--
-- Name: cost_column; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.cost_column (
    company_id bigint NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    account_grp text NOT NULL,
    sort_order smallint DEFAULT 0 NOT NULL,
    CONSTRAINT cost_column_account_grp_check CHECK ((account_grp = ANY (ARRAY['622'::text, '627'::text])))
);


--
-- Name: cost_material_line; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.cost_material_line (
    id bigint NOT NULL,
    run_id bigint NOT NULL,
    order_id bigint NOT NULL,
    company_id bigint NOT NULL,
    item_code text NOT NULL,
    norm_qty numeric(18,6) DEFAULT 0 NOT NULL,
    adjustment_qty numeric(18,6) DEFAULT 0 NOT NULL,
    total_qty numeric(18,6) DEFAULT 0 NOT NULL,
    unit_price numeric(18,4) DEFAULT 0 NOT NULL,
    amount numeric(20,4) DEFAULT 0 NOT NULL,
    is_substitute boolean DEFAULT false NOT NULL
);


--
-- Name: cost_material_line_id_seq; Type: SEQUENCE; Schema: giathanh; Owner: -
--

CREATE SEQUENCE giathanh.cost_material_line_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cost_material_line_id_seq; Type: SEQUENCE OWNED BY; Schema: giathanh; Owner: -
--

ALTER SEQUENCE giathanh.cost_material_line_id_seq OWNED BY giathanh.cost_material_line.id;


--
-- Name: cost_order_result; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.cost_order_result (
    run_id bigint NOT NULL,
    order_id bigint NOT NULL,
    output_qty numeric(18,4) DEFAULT 0 NOT NULL,
    c621 numeric(20,4) DEFAULT 0 NOT NULL,
    c622 numeric(20,4) DEFAULT 0 NOT NULL,
    c627 numeric(20,4) DEFAULT 0 NOT NULL,
    c154 numeric(20,4) DEFAULT 0 NOT NULL,
    unit_cost numeric(18,4) DEFAULT 0 NOT NULL
);


--
-- Name: cost_run; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.cost_run (
    id bigint NOT NULL,
    company_id bigint NOT NULL,
    period character(7) NOT NULL,
    calculated_at timestamp with time zone DEFAULT now() NOT NULL,
    calculated_by text,
    is_locked_snapshot boolean DEFAULT false NOT NULL,
    sum_621 numeric(20,4) DEFAULT 0 NOT NULL,
    sum_622 numeric(20,4) DEFAULT 0 NOT NULL,
    sum_627 numeric(20,4) DEFAULT 0 NOT NULL,
    sum_154 numeric(20,4) DEFAULT 0 NOT NULL,
    revenue numeric(20,4) DEFAULT 0 NOT NULL,
    gross_profit numeric(20,4) DEFAULT 0 NOT NULL,
    closing_value numeric(20,4) DEFAULT 0 NOT NULL,
    warnings jsonb DEFAULT '[]'::jsonb NOT NULL,
    CONSTRAINT cost_run_period_check CHECK ((period ~ '^\d{4}-\d{2}$'::text))
);


--
-- Name: cost_run_id_seq; Type: SEQUENCE; Schema: giathanh; Owner: -
--

CREATE SEQUENCE giathanh.cost_run_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cost_run_id_seq; Type: SEQUENCE OWNED BY; Schema: giathanh; Owner: -
--

ALTER SEQUENCE giathanh.cost_run_id_seq OWNED BY giathanh.cost_run.id;


--
-- Name: inventory_result; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.inventory_result (
    run_id bigint NOT NULL,
    company_id bigint NOT NULL,
    item_code text NOT NULL,
    open_qty numeric(18,4) DEFAULT 0 NOT NULL,
    open_amount numeric(20,4) DEFAULT 0 NOT NULL,
    in_qty numeric(18,4) DEFAULT 0 NOT NULL,
    in_amount numeric(20,4) DEFAULT 0 NOT NULL,
    out_qty numeric(18,4) DEFAULT 0 NOT NULL,
    out_amount numeric(20,4) DEFAULT 0 NOT NULL,
    close_qty numeric(18,4) DEFAULT 0 NOT NULL,
    close_amount numeric(20,4) DEFAULT 0 NOT NULL,
    avg_cost numeric(18,4) DEFAULT 0 NOT NULL,
    avg_daily_qty numeric(18,4),
    stock_days numeric(12,2),
    need_5days numeric(18,4),
    status text
);


--
-- Name: item; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.item (
    company_id bigint NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    group_code text NOT NULL,
    uom text NOT NULL,
    warehouse text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: item_group; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.item_group (
    code text NOT NULL,
    name text NOT NULL,
    is_finished boolean DEFAULT false NOT NULL
);


--
-- Name: material_substitution; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.material_substitution (
    id bigint NOT NULL,
    company_id bigint NOT NULL,
    product_code text,
    material_code text NOT NULL,
    substitute_code text NOT NULL,
    valid_from date,
    valid_to date,
    ratio numeric(9,6) DEFAULT 1 NOT NULL,
    note text,
    CONSTRAINT material_substitution_check CHECK (((valid_to IS NULL) OR (valid_from IS NULL) OR (valid_to >= valid_from)))
);


--
-- Name: material_substitution_id_seq; Type: SEQUENCE; Schema: giathanh; Owner: -
--

CREATE SEQUENCE giathanh.material_substitution_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: material_substitution_id_seq; Type: SEQUENCE OWNED BY; Schema: giathanh; Owner: -
--

ALTER SEQUENCE giathanh.material_substitution_id_seq OWNED BY giathanh.material_substitution.id;


--
-- Name: opening_balance; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.opening_balance (
    company_id bigint NOT NULL,
    period character(7) NOT NULL,
    item_code text NOT NULL,
    qty numeric(18,4) DEFAULT 0 NOT NULL,
    amount numeric(20,4) DEFAULT 0 NOT NULL,
    warehouse text,
    CONSTRAINT opening_balance_period_check CHECK ((period ~ '^\d{4}-\d{2}$'::text))
);


--
-- Name: order_material_adjustment; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.order_material_adjustment (
    id bigint NOT NULL,
    company_id bigint NOT NULL,
    order_id bigint NOT NULL,
    item_code text NOT NULL,
    adjustment_qty numeric(18,4) NOT NULL,
    reason text
);


--
-- Name: order_material_adjustment_id_seq; Type: SEQUENCE; Schema: giathanh; Owner: -
--

CREATE SEQUENCE giathanh.order_material_adjustment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_material_adjustment_id_seq; Type: SEQUENCE OWNED BY; Schema: giathanh; Owner: -
--

ALTER SEQUENCE giathanh.order_material_adjustment_id_seq OWNED BY giathanh.order_material_adjustment.id;


--
-- Name: period_cost; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.period_cost (
    company_id bigint NOT NULL,
    period character(7) NOT NULL,
    cost_code text NOT NULL,
    amount numeric(20,4) DEFAULT 0 NOT NULL,
    CONSTRAINT period_cost_period_check CHECK ((period ~ '^\d{4}-\d{2}$'::text))
);


--
-- Name: period_lock; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.period_lock (
    company_id bigint NOT NULL,
    period character(7) NOT NULL,
    locked_at timestamp with time zone DEFAULT now() NOT NULL,
    locked_by text,
    CONSTRAINT period_lock_period_check CHECK ((period ~ '^\d{4}-\d{2}$'::text))
);


--
-- Name: production_capacity; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.production_capacity (
    id bigint NOT NULL,
    company_id bigint NOT NULL,
    product_code text NOT NULL,
    valid_from date,
    valid_to date,
    runs_per_day numeric(18,4),
    runs_per_month numeric(18,4),
    note text
);


--
-- Name: production_capacity_id_seq; Type: SEQUENCE; Schema: giathanh; Owner: -
--

CREATE SEQUENCE giathanh.production_capacity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: production_capacity_id_seq; Type: SEQUENCE OWNED BY; Schema: giathanh; Owner: -
--

ALTER SEQUENCE giathanh.production_capacity_id_seq OWNED BY giathanh.production_capacity.id;


--
-- Name: production_order; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.production_order (
    id bigint NOT NULL,
    company_id bigint NOT NULL,
    order_code text NOT NULL,
    material_issue_date date NOT NULL,
    production_date date,
    product_code text NOT NULL,
    bom_type text DEFAULT 'DM'::text NOT NULL,
    planned_batches numeric(18,4) DEFAULT 0 NOT NULL,
    batch_adjustment numeric(18,4) DEFAULT 0 NOT NULL,
    proposed_batches numeric(18,4) DEFAULT 0 NOT NULL,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: production_order_id_seq; Type: SEQUENCE; Schema: giathanh; Owner: -
--

CREATE SEQUENCE giathanh.production_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: production_order_id_seq; Type: SEQUENCE OWNED BY; Schema: giathanh; Owner: -
--

ALTER SEQUENCE giathanh.production_order_id_seq OWNED BY giathanh.production_order.id;


--
-- Name: production_plan; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.production_plan (
    id bigint NOT NULL,
    company_id bigint NOT NULL,
    production_date date NOT NULL,
    product_code text NOT NULL,
    batches numeric(18,4) DEFAULT 0 NOT NULL,
    note text
);


--
-- Name: production_plan_id_seq; Type: SEQUENCE; Schema: giathanh; Owner: -
--

CREATE SEQUENCE giathanh.production_plan_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: production_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: giathanh; Owner: -
--

ALTER SEQUENCE giathanh.production_plan_id_seq OWNED BY giathanh.production_plan.id;


--
-- Name: purchase; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.purchase (
    id bigint NOT NULL,
    company_id bigint NOT NULL,
    receipt_date date NOT NULL,
    invoice_date date,
    invoice_no text,
    supplier text,
    item_code text NOT NULL,
    qty numeric(18,4) DEFAULT 0 NOT NULL,
    unit_price numeric(18,4) DEFAULT 0 NOT NULL,
    amount numeric(20,4) DEFAULT 0 NOT NULL,
    warehouse text,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: purchase_id_seq; Type: SEQUENCE; Schema: giathanh; Owner: -
--

CREATE SEQUENCE giathanh.purchase_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_id_seq; Type: SEQUENCE OWNED BY; Schema: giathanh; Owner: -
--

ALTER SEQUENCE giathanh.purchase_id_seq OWNED BY giathanh.purchase.id;


--
-- Name: risk_threshold; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.risk_threshold (
    company_id bigint NOT NULL,
    risk_key text NOT NULL,
    warn_value numeric(18,4),
    high_value numeric(18,4)
);


--
-- Name: sale; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.sale (
    id bigint NOT NULL,
    company_id bigint NOT NULL,
    invoice_date date NOT NULL,
    item_code text NOT NULL,
    qty numeric(18,4) DEFAULT 0 NOT NULL,
    revenue numeric(20,4) DEFAULT 0 NOT NULL,
    unit_price numeric(18,4) GENERATED ALWAYS AS (
CASE
    WHEN (qty <> (0)::numeric) THEN round((revenue / qty), 2)
    ELSE (0)::numeric
END) STORED,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sale_id_seq; Type: SEQUENCE; Schema: giathanh; Owner: -
--

CREATE SEQUENCE giathanh.sale_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sale_id_seq; Type: SEQUENCE OWNED BY; Schema: giathanh; Owner: -
--

ALTER SEQUENCE giathanh.sale_id_seq OWNED BY giathanh.sale.id;


--
-- Name: v_item_has_bom; Type: VIEW; Schema: giathanh; Owner: -
--

CREATE VIEW giathanh.v_item_has_bom AS
 SELECT company_id,
    code,
    name,
    group_code,
    ((EXISTS ( SELECT 1
           FROM giathanh.bom_line b
          WHERE ((b.company_id = i.company_id) AND ((b.product_code = i.code) OR (b.material_code = i.code) OR (b.substitute_code = i.code))))) OR (EXISTS ( SELECT 1
           FROM giathanh.material_substitution s
          WHERE ((s.company_id = i.company_id) AND ((s.material_code = i.code) OR (s.substitute_code = i.code)))))) AS has_bom
   FROM giathanh.item i;


--
-- Name: v_period_cost_summary; Type: VIEW; Schema: giathanh; Owner: -
--

CREATE VIEW giathanh.v_period_cost_summary AS
 SELECT pc.company_id,
    pc.period,
    sum(pc.amount) FILTER (WHERE (cc.account_grp = '622'::text)) AS total_622,
    sum(pc.amount) FILTER (WHERE (cc.account_grp = '627'::text)) AS total_627
   FROM (giathanh.period_cost pc
     JOIN giathanh.cost_column cc ON (((cc.company_id = pc.company_id) AND (cc.code = pc.cost_code))))
  GROUP BY pc.company_id, pc.period;


--
-- Name: v_purchase_without_invoice; Type: VIEW; Schema: giathanh; Owner: -
--

CREATE VIEW giathanh.v_purchase_without_invoice AS
 SELECT id,
    company_id,
    receipt_date,
    invoice_date,
    invoice_no,
    supplier,
    item_code,
    qty,
    unit_price,
    amount,
    warehouse,
    note,
    created_at,
    updated_at
   FROM giathanh.purchase
  WHERE ((invoice_no IS NULL) OR (btrim(invoice_no) = ''::text));


--
-- Name: work_calendar; Type: TABLE; Schema: giathanh; Owner: -
--

CREATE TABLE giathanh.work_calendar (
    company_id bigint NOT NULL,
    day date NOT NULL,
    kind text NOT NULL,
    note text,
    CONSTRAINT work_calendar_kind_check CHECK ((kind = ANY (ARRAY['HOLIDAY'::text, 'STANDBY'::text, 'OVERTIME'::text])))
);


--
-- Name: bom_line id; Type: DEFAULT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.bom_line ALTER COLUMN id SET DEFAULT nextval('giathanh.bom_line_id_seq'::regclass);


--
-- Name: common_issue id; Type: DEFAULT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.common_issue ALTER COLUMN id SET DEFAULT nextval('giathanh.common_issue_id_seq'::regclass);


--
-- Name: company id; Type: DEFAULT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.company ALTER COLUMN id SET DEFAULT nextval('giathanh.company_id_seq'::regclass);


--
-- Name: cost_material_line id; Type: DEFAULT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.cost_material_line ALTER COLUMN id SET DEFAULT nextval('giathanh.cost_material_line_id_seq'::regclass);


--
-- Name: cost_run id; Type: DEFAULT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.cost_run ALTER COLUMN id SET DEFAULT nextval('giathanh.cost_run_id_seq'::regclass);


--
-- Name: material_substitution id; Type: DEFAULT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.material_substitution ALTER COLUMN id SET DEFAULT nextval('giathanh.material_substitution_id_seq'::regclass);


--
-- Name: order_material_adjustment id; Type: DEFAULT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.order_material_adjustment ALTER COLUMN id SET DEFAULT nextval('giathanh.order_material_adjustment_id_seq'::regclass);


--
-- Name: production_capacity id; Type: DEFAULT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.production_capacity ALTER COLUMN id SET DEFAULT nextval('giathanh.production_capacity_id_seq'::regclass);


--
-- Name: production_order id; Type: DEFAULT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.production_order ALTER COLUMN id SET DEFAULT nextval('giathanh.production_order_id_seq'::regclass);


--
-- Name: production_plan id; Type: DEFAULT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.production_plan ALTER COLUMN id SET DEFAULT nextval('giathanh.production_plan_id_seq'::regclass);


--
-- Name: purchase id; Type: DEFAULT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.purchase ALTER COLUMN id SET DEFAULT nextval('giathanh.purchase_id_seq'::regclass);


--
-- Name: sale id; Type: DEFAULT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.sale ALTER COLUMN id SET DEFAULT nextval('giathanh.sale_id_seq'::regclass);


--
-- Data for Name: bom_line; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.bom_line (id, company_id, bom_type, product_code, material_code, product_qty, material_qty, runs_per_day, loss_pct, substitute_code, valid_from, valid_to, substitute_ratio, note, created_at, updated_at) FROM stdin;
1	1	DM	BO	DAU	23.0000	18.000000	16.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
2	1	DM	BO	TRGA	23.0000	30.000000	16.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
3	1	DM	BO	TBB	23.0000	1.000000	16.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
4	1	DM	BO	MBB	23.0000	0.230000	16.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
5	1	DM	BO	DUONG	23.0000	0.200000	16.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
6	1	DM	BO	PG_ACSO	23.0000	0.020000	16.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
7	1	DM	BO	MUOI	23.0000	0.200000	16.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
8	1	DM	DABAO	DAHE	250.0000	110.000000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
9	1	DM	DABAO	THHE	250.0000	25.000000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
10	1	DM	DABAO	TIHE	250.0000	45.000000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
11	1	DM	DABAO	MUIHEO	250.0000	35.000000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
12	1	DM	DABAO	DNCA	250.0000	15.000000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
13	1	DM	DABAO	THGA	250.0000	9.000000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
14	1	DM	DABAO	TGA_X	250.0000	6.000000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
15	1	DM	DABAO	BB_TG	250.0000	600.000000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
16	1	DM	DABAO	PG_TP2	250.0000	0.880000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
17	1	DM	DABAO	PG_NPP	250.0000	0.750000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
18	1	DM	DABAO	PG_ENZY	250.0000	0.530000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
19	1	DM	DABAO	PG_HHQ	250.0000	0.240000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
20	1	DM	DABAO	PG_HUTH	250.0000	0.240000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
21	1	DM	DABAO	PG_DAI	250.0000	0.375000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
22	1	DM	DABAO	TBB	250.0000	2.000000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
23	1	DM	DABAO	PG_GION	250.0000	0.375000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
24	1	DM	DABAO	PG_OFP	250.0000	0.210000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
25	1	DM	DABAO	PG_POSO	250.0000	0.210000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
26	1	DM	DABAO	PG_TP1	250.0000	0.300000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
27	1	DM	DABAO	DAKE	250.0000	125.000000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
28	1	DM	DABAO	DUONG	250.0000	1.000000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
29	1	DM	DABAO	TIEU	250.0000	0.100000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
30	1	DM	DABAO	PG_ACSO	250.0000	0.130000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
31	1	DM	DABAO	PG_PM	250.0000	0.050000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
32	1	DM	DABAO	TOI	250.0000	0.100000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
33	1	DM	DABAO	NHAN_DB	250.0000	500.000000	3.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
34	1	DM	DABAONAC	THHE	280.0000	155.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
35	1	DM	DABAONAC	THGA	280.0000	37.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
36	1	DM	DABAONAC	DAHE	280.0000	35.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
37	1	DM	DABAONAC	PG_DAI	280.0000	4.760000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
38	1	DM	DABAONAC	PG_GION	280.0000	4.760000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
39	1	DM	DABAONAC	TUIPE	280.0000	560.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
40	1	DM	DABAONAC	DNCA	280.0000	10.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
41	1	DM	DABAONAC	TGA_X	280.0000	13.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
42	1	DM	DABAONAC	MUIHEO1	280.0000	1.500000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
43	1	DM	DABAONAC	MOHE	280.0000	10.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
44	1	DM	DABAONAC	MANH	280.0000	80.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
45	1	DM	DABAONAC	BOTO	280.0000	2.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
46	1	DM	DABAONAC	DAKE	280.0000	1120.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
47	1	DM	DABAONAC	PG_TP2	280.0000	1.120000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
48	1	DM	DABAONAC	PG_ENZY	280.0000	0.980000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
49	1	DM	DABAONAC	PG_NEO	280.0000	0.500000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
50	1	DM	DABAONAC	TIEU	280.0000	0.500000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
51	1	DM	DABAONAC	BOMI	280.0000	5.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
52	1	DM	DABAONAC	PG_BONG	280.0000	2.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
53	1	DM	DABAONAC	PG_TP1	280.0000	0.840000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
54	1	DM	DABAONAC	PG_SOER	280.0000	0.280000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
55	1	DM	DABAONAC	PG_OFP	280.0000	0.280000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
56	1	DM	DABAONAC	PG_HUTH	280.0000	0.150000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
57	1	DM	DABAONAC	PG_ACSO	280.0000	0.280000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
58	1	DM	DABAONAC	DUONG	280.0000	2.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
59	1	DM	DABAONAC	PG_HNM	280.0000	0.150000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
60	1	DM	DABAONAC	NHAN_DBND	280.0000	560.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
61	1	DM	GIOLUA1	THHE	24.0000	14.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
62	1	DM	GIOLUA1	TGA_X	24.0000	12.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
63	1	DM	GIOLUA1	MOHE	24.0000	4.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
64	1	DM	GIOLUA1	LAC	24.0000	3.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
65	1	DM	GIOLUA1	TBB	24.0000	1.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
66	1	DM	GIOLUA1	PG_TP2	24.0000	0.140000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
67	1	DM	GIOLUA1	PG_ENZY	24.0000	0.102000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
68	1	DM	GIOLUA1	PG_OFP	24.0000	0.032000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
69	1	DM	GIOLUA1	PG_ACSO	24.0000	0.035000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
70	1	DM	GIOLUA1	PG_POSO	24.0000	0.035000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
71	1	DM	GIOLUA1	PG_DAI	24.0000	0.008500	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
72	1	DM	GIOLUA1	PG_GION	24.0000	0.008500	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
73	1	DM	GIOLUA2	THGA	30.0000	12.000000	6.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
74	1	DM	GIOLUA2	DECA	30.0000	7.000000	6.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
75	1	DM	GIOLUA2	MOHE	30.0000	8.000000	6.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
76	1	DM	GIOLUA2	LAC	30.0000	5.000000	6.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
77	1	DM	GIOLUA2	TGA_X	30.0000	2.000000	6.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
78	1	DM	GIOLUA2	TBB	30.0000	2.000000	6.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
79	1	DM	GIOLUA2	PG_TP2	30.0000	0.170000	6.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
80	1	DM	GIOLUA2	PG_ENZY	30.0000	0.125000	6.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
81	1	DM	GIOLUA2	PG_DAI	30.0000	0.070000	6.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
82	1	DM	GIOLUA2	PG_GION	30.0000	0.070000	6.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
83	1	DM	GIOLUA2	NUMA	30.0000	0.300000	6.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
84	1	DM	GIOLUA2	PG_OFP	30.0000	0.039000	6.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
85	1	DM	GIOLUA2	PG_ACSO	30.0000	0.040000	6.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
86	1	DM	GIOLUA2	PG_POSO	30.0000	0.042000	6.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
87	1	DM	GIOLUA2	PG_BONG	30.0000	0.040000	6.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
88	1	DM	GIOLUA2	DUONG	30.0000	0.040000	6.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
89	1	DM	GIOLUA2	NHAN_GL2	30.0000	60.000000	6.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
90	1	DM	GTMOC	DAHE	150.0000	90.000000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
91	1	DM	GTMOC	MUIHEO	150.0000	20.000000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
92	1	DM	GTMOC	DNCA	150.0000	15.000000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
93	1	DM	GTMOC	THGA	150.0000	9.000000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
94	1	DM	GTMOC	TGA_X	150.0000	8.000000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
95	1	DM	GTMOC	TUIPE	150.0000	300.000000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
96	1	DM	GTMOC	DECA	150.0000	5.000000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
97	1	DM	GTMOC	PG_TP2	150.0000	0.640000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
98	1	DM	GTMOC	PG_NPP	150.0000	0.500000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
99	1	DM	GTMOC	TBB	150.0000	2.000000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
100	1	DM	GTMOC	PG_ENZY	150.0000	0.390000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
101	1	DM	GTMOC	PG_DAI	150.0000	0.275000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
102	1	DM	GTMOC	PG_HHQ	150.0000	0.120000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
103	1	DM	GTMOC	PG_GION	150.0000	0.275000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
104	1	DM	GTMOC	PG_HUTH	150.0000	0.120000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
105	1	DM	GTMOC	PG_OFP	150.0000	0.150000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
106	1	DM	GTMOC	PG_POSO	150.0000	0.150000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
107	1	DM	GTMOC	PG_TP1	150.0000	0.200000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
108	1	DM	GTMOC	PG_ACSO	150.0000	0.095000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
109	1	DM	GTMOC	BOTO	150.0000	0.100000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
110	1	DM	GTMOC	DAKE	150.0000	75.000000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
111	1	DM	GTMOC	TOI	150.0000	0.100000	4.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
112	1	DM	GTXAO	TAHE	150.0000	30.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
113	1	DM	GTXAO	LUHE	150.0000	30.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
114	1	DM	GTXAO	DAHE	150.0000	55.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
115	1	DM	GTXAO	MUIHEO	150.0000	30.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
116	1	DM	GTXAO	TUIPE	150.0000	300.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
117	1	DM	GTXAO	PG_TP2	150.0000	0.500000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
118	1	DM	GTXAO	MUIHEO1	150.0000	0.250000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
119	1	DM	GTXAO	PG_BONG	150.0000	1.500000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
120	1	DM	GTXAO	PG_HHQ	150.0000	0.200000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
121	1	DM	GTXAO	PG_ENZY	150.0000	0.350000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
122	1	DM	GTXAO	MOCNHI	150.0000	0.500000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
123	1	DM	GTXAO	BOTO	150.0000	0.300000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
124	1	DM	GTXAO	BOTHANH	150.0000	0.300000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
125	1	DM	GTXAO	DUONG	150.0000	1.500000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
126	1	DM	GTXAO	PG_OFP	150.0000	0.160000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
127	1	DM	GTXAO	PG_DAI	150.0000	0.150000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
128	1	DM	GTXAO	PG_ACSO	150.0000	0.150000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
129	1	DM	GTXAO	PG_GION	150.0000	0.150000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
130	1	DM	GTXAO	PG_POSO	150.0000	0.160000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
131	1	DM	GTXAO	DAKE	150.0000	75.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
132	1	DM	GTXAO	PG_TP1	150.0000	0.150000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
133	1	DM	GTXAO	NUTU	150.0000	0.200000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
134	1	DM	NEM1	THGA	243.0000	40.500000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
135	1	DM	NEM1	DNCA	243.0000	45.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
136	1	DM	NEM1	DUONG	243.0000	72.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
137	1	DM	NEM1	DAHE	243.0000	32.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
138	1	DM	NEM1	BB_TNV	243.0000	1550.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
139	1	DM	NEM1	DECA	243.0000	15.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
140	1	DM	NEM1	CHCA	243.0000	10.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
141	1	DM	NEM1	TIEU	243.0000	2.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
142	1	DM	NEM1	BB_TG	243.0000	1550.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
143	1	DM	NEM1	TOI	243.0000	8.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
144	1	DM	NEM1	OT	243.0000	5.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
145	1	DM	NEM1	DAKE_1	243.0000	52.700000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
146	1	DM	NEM1	PG_ROSSOC	243.0000	0.166000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
147	1	DM	NEM1	PG_COFI	243.0000	0.500000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
148	1	DM	NEM1	PG_VWG	243.0000	2.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
149	1	DM	NEM1	PG_BONG	243.0000	2.500000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
150	1	DM	NEM1	PG_K7	243.0000	0.500000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
151	1	DM	NEM1	PG_MEPL	243.0000	0.500000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
152	1	DM	NEM1	PG_SUPH	243.0000	0.500000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
153	1	DM	NEM1	MANH	243.0000	22.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
154	1	DM	NEM1	DUONGPHEN	243.0000	2.500000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
155	1	DM	NEM1	NUMA	243.0000	2.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
156	1	DM	NEM1	PG_POSO	243.0000	0.330000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
157	1	DM	NEM1	PG_ENZY	243.0000	0.250000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
158	1	DM	NEM1	PG_SOER	243.0000	0.166000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
159	1	DM	NEM1	PG_TP1	243.0000	0.330000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
160	1	DM	NEM1	PG_ACSO	243.0000	0.083000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
161	1	DM	NEM1	PG_GDL	243.0000	0.083000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
162	1	DM	NEM1	MUOI	243.0000	2.600000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
163	1	DM	NEM2	THGA	243.0000	40.500000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
164	1	DM	NEM2	DNCA	243.0000	45.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
165	1	DM	NEM2	DUONG	243.0000	72.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
166	1	DM	NEM2	DAHE	243.0000	32.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
167	1	DM	NEM2	BB_TNX	243.0000	1550.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
168	1	DM	NEM2	DECA	243.0000	15.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
169	1	DM	NEM2	CHCA	243.0000	10.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
170	1	DM	NEM2	TIEU	243.0000	2.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
171	1	DM	NEM2	BB_TG	243.0000	1550.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
172	1	DM	NEM2	TOI	243.0000	8.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
173	1	DM	NEM2	OT	243.0000	5.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
174	1	DM	NEM2	DAKE_1	243.0000	52.700000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
175	1	DM	NEM2	PG_ROSSOC	243.0000	0.166000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
176	1	DM	NEM2	PG_COFI	243.0000	0.500000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
177	1	DM	NEM2	PG_VWG	243.0000	2.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
178	1	DM	NEM2	PG_BONG	243.0000	2.500000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
179	1	DM	NEM2	PG_K7	243.0000	0.500000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
180	1	DM	NEM2	PG_MEPL	243.0000	0.500000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
181	1	DM	NEM2	PG_SUPH	243.0000	0.500000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
182	1	DM	NEM2	MANH	243.0000	22.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
183	1	DM	NEM2	DUONGPHEN	243.0000	2.500000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
184	1	DM	NEM2	NUMA	243.0000	2.000000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
185	1	DM	NEM2	PG_POSO	243.0000	0.330000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
186	1	DM	NEM2	PG_ENZY	243.0000	0.250000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
187	1	DM	NEM2	PG_SOER	243.0000	0.166000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
188	1	DM	NEM2	PG_TP1	243.0000	0.330000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
189	1	DM	NEM2	PG_ACSO	243.0000	0.083000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
190	1	DM	NEM2	PG_GDL	243.0000	0.083000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
191	1	DM	NEM2	MUOI	243.0000	2.600000	12.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
192	1	DM	PATE1	MOHE	380.0000	120.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
193	1	DM	PATE1	GAHE	380.0000	100.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
194	1	DM	PATE1	PG_EHCT	380.0000	1.400000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
195	1	DM	PATE1	PG_ELPF	380.0000	1.300000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
196	1	DM	PATE1	BB_PATE	380.0000	760.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
197	1	DM	PATE1	TBB	380.0000	12.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
198	1	DM	PATE1	MANH	380.0000	76.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
199	1	DM	PATE1	TOI	380.0000	6.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
200	1	DM	PATE1	DUONG	380.0000	10.500000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
201	1	DM	PATE1	BOMI	380.0000	10.500000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
202	1	DM	PATE1	PG_STPP	380.0000	1.500000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
203	1	DM	PATE1	PG_SCC	380.0000	1.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
204	1	DM	PATE1	HANH	380.0000	8.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
205	1	DM	PATE1	DAKE_1	380.0000	25.840000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
206	1	DM	PATE1	PG_TP8M	380.0000	1.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
207	1	DM	PATE1	BONA	380.0000	5.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
208	1	DM	PATE1	PG_TP1	380.0000	0.750000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
209	1	DM	PATE1	PG_OFP	380.0000	0.300000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
210	1	DM	PATE1	PG_SOER	380.0000	0.200000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
211	1	DM	PATE2	MOHE	360.0000	120.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
212	1	DM	PATE2	GAHE	360.0000	60.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
213	1	DM	PATE2	BB_PATE	360.0000	760.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
214	1	DM	PATE2	BONA	360.0000	30.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
215	1	DM	PATE2	BOMI	360.0000	24.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
216	1	DM	PATE2	MANH	360.0000	76.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
217	1	DM	PATE2	PG_EHCT	360.0000	0.400000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
218	1	DM	PATE2	PG_ELPF	360.0000	0.400000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
219	1	DM	PATE2	TOI	360.0000	6.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
220	1	DM	PATE2	DUONG	360.0000	11.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
221	1	DM	PATE2	PG_STPP	360.0000	1.500000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
222	1	DM	PATE2	PG_SCC	360.0000	1.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
223	1	DM	PATE2	HANH	360.0000	8.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
224	1	DM	PATE2	DAKE_1	360.0000	25.840000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
225	1	DM	PATE2	PG_TP8M	360.0000	1.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
226	1	DM	PATE2	PG_TP1	360.0000	1.000000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
227	1	DM	PATE2	PG_OFP	360.0000	0.300000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
228	1	DM	PATE2	PG_SOER	360.0000	0.200000	2.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
229	1	DM	BOVIEN	THGA	110.0000	47.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
230	1	DM	BOVIEN	DNCA	110.0000	30.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
231	1	DM	BOVIEN	TGA_X	110.0000	10.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
232	1	DM	BOVIEN	DAHE	110.0000	15.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
233	1	DM	BOVIEN	BOMI	110.0000	4.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
234	1	DM	BOVIEN	PG_CARAMEL	110.0000	0.400000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
235	1	DM	BOVIEN	PG_GION	110.0000	0.175000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
236	1	DM	BOVIEN	PG_DAI	110.0000	0.175000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
237	1	DM	BOVIEN	PG_ENZY	110.0000	0.350000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
238	1	DM	BOVIEN	PG_TP2	110.0000	0.400000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
239	1	DM	BOVIEN	PG_ACSO	110.0000	0.100000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
240	1	DM	BOVIEN	PG_SOER	110.0000	0.100000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
241	1	DM	BOVIEN	PG_OFP	110.0000	0.100000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
242	1	DM	BOVIEN	PG_NEO	110.0000	0.070000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
243	1	DM	BOVIEN	PG_NPP	110.0000	0.030000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
244	1	DM	BOVIEN	DUONG	110.0000	1.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
245	1	DM	BOVIEN	PG_BONG	110.0000	1.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
246	1	DM	BOVIEN	BOTO	110.0000	0.500000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
247	1	DM	BOVIEN	MUIHEO1	110.0000	0.200000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
248	1	DM	BOVIEN	TUIPE	110.0000	110.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
249	1	DM	CHALUA_OX	THGA	44.0000	18.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
250	1	DM	CHALUA_OX	DNCA	44.0000	5.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
251	1	DM	CHALUA_OX	DAHE	44.0000	14.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
252	1	DM	CHALUA_OX	MOHE	44.0000	5.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
253	1	DM	CHALUA_OX	TBB	44.0000	1.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
254	1	DM	CHALUA_OX	PG_GION	44.0000	0.080000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
255	1	DM	CHALUA_OX	PG_DAI	44.0000	0.080000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
256	1	DM	CHALUA_OX	PG_ENZY	44.0000	0.154000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
257	1	DM	CHALUA_OX	PG_TP2	44.0000	0.176000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
258	1	DM	CHALUA_OX	PG_ACSO	44.0000	0.044000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
259	1	DM	CHALUA_OX	PG_SOER	44.0000	0.044000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
260	1	DM	CHALUA_OX	PG_OFP	44.0000	0.044000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
261	1	DM	CHALUA_OX	DUONG	44.0000	1.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
262	1	DM	CHALUA_OX	PG_BONG	44.0000	1.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
263	1	DM	CHALUA_OX	OT	44.0000	2.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
264	1	DM	CHALUA_OX	MUIHEO1	44.0000	0.088000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
265	1	DM	CHALUA_OX	PG_HUTH	44.0000	0.150000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
266	1	DM	CHALUA_OX	PG_HNM	44.0000	0.150000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
267	1	DM	CHALUA_OX	TUIPE	44.0000	44.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
268	1	DM	CHALUA_OX	DAKE	44.0000	176.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
269	1	DM	CHALUA_OX	NHAN_OX	44.0000	88.000000	1.0000	0.000000	\N	\N	\N	0.000000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
\.


--
-- Data for Name: common_issue; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.common_issue (id, company_id, voucher_no, issue_date, item_code, qty, issue_type, reason) FROM stdin;
\.


--
-- Data for Name: company; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.company (id, code, name, created_at, updated_at) FROM stdin;
1	THAOVY	KH Thảo Vy	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
\.


--
-- Data for Name: company_setting; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.company_setting (company_id, start_period, work_year, sunday_off, alloc_basis_622, alloc_basis_627, stale_days, reserve_days, ignore_days, misa_partner_code, misa_partner_name, misa_debit_issue, misa_credit_recv, holidays_2026_seeded, extra, updated_at) FROM stdin;
1	2026-10	2026	t	kg	kg	\N	\N	\N	\N	\N	\N	\N	t	{}	2026-11-04 18:11:03.316192+07
\.


--
-- Data for Name: cost_column; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.cost_column (company_id, code, label, account_grp, sort_order) FROM stdin;
1	c622	622 Nhân công	622	0
1	c6273	6273 Dụng cụ	627	1
1	c6274	6274 Khấu hao	627	2
1	dien	Điện	627	3
1	nuoc	Nước	627	4
1	khac	Chi phí khác	627	5
\.


--
-- Data for Name: cost_material_line; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.cost_material_line (id, run_id, order_id, company_id, item_code, norm_qty, adjustment_qty, total_qty, unit_price, amount, is_substitute) FROM stdin;
\.


--
-- Data for Name: cost_order_result; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.cost_order_result (run_id, order_id, output_qty, c621, c622, c627, c154, unit_cost) FROM stdin;
\.


--
-- Data for Name: cost_run; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.cost_run (id, company_id, period, calculated_at, calculated_by, is_locked_snapshot, sum_621, sum_622, sum_627, sum_154, revenue, gross_profit, closing_value, warnings) FROM stdin;
\.


--
-- Data for Name: inventory_result; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.inventory_result (run_id, company_id, item_code, open_qty, open_amount, in_qty, in_amount, out_qty, out_amount, close_qty, close_amount, avg_cost, avg_daily_qty, stock_days, need_5days, status) FROM stdin;
\.


--
-- Data for Name: item; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.item (company_id, code, name, group_code, uom, warehouse, created_at, updated_at) FROM stdin;
1	BO	Bơ	Thành phẩm	kg	155	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PATE1	Pate (Loại 1)	Thành phẩm	kg	155	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PATE2	Pate (Loại 2)	Thành phẩm	kg	155	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	GTMOC	Giò thủ mộc	Thành phẩm	kg	155	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	GTXAO	Giò thủ xào	Thành phẩm	kg	155	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	GIOLUA1	Giò lụa (loại 1)	Thành phẩm	kg	155	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	GIOLUA2	Giò lụa (loại 2)	Thành phẩm	kg	155	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	DABAO	Da bao đỏ	Thành phẩm	kg	155	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	DABAONAC	Da bao nạc	Thành phẩm	kg	155	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	NEM1	Nem chua Huế (loại 1)	Thành phẩm	kg	155	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	NEM2	Nem chua Huế (loại 2)	Thành phẩm	kg	155	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	BOVIEN	Bò viên	Thành phẩm	kg	155	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	CHALUA_OX	Chả lụa ớt xiêm	Thành phẩm	kg	155	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	DAU	Dầu ăn dinh dưỡng 100% từ cá - Ranee	NVLC	Lít	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	BOMI	Bột mì	NVLC	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	BONA	Bột năng	NVLC	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	TGA_X	Thịt gà xay	NVLC	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	MUIHEO	Mũi heo	NVLC	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	TAHE	Tai heo	NVLC	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	THHE	Thịt heo	NVLC	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	TIHE	Tim heo	NVLC	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	LUHE	Lưỡi heo	NVLC	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	DNCA	Dè nạc cá tra xay	NVLC	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	THGA	Thịt gà	NVLC	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	DAHE	Da heo	NVLC	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	DECA	Dè mỡ cá tra	NVLC	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	GAHE	Gan heo	NVLC	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	TRGA	Trứng gà	NVLC	Quả	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	CHCA	Chả cá độ dai 100/200	NVLC	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	MOHE	Mỡ heo	NVLC	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_PM	Phụ gia thực phẩm - phẩm màu Sunset Yellow (màu da bao)	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_DAI	Phụ gia thực phẩm Naphos K100 NEW (Dai)	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_GION	Phụ Gia Thực Phẩm : PolyPhos	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_ACSO	Phụ gia thực phẩm: Acid Sorbic	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_GDL	Phụ gia thực phẩm Glucono Delta Lactone T	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_TP2	Phụ gia thực phẩm: Foco - TP2 (Bảo Quản)	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_HHQ	Hương heo quay	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_HUTH	Hương thịt	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	MUIHEO1	Phụ gia thực phẩm: hỗn hợp chất làm dày Greeninno HBV03010004	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_ROSSOC	Phụ gia thực phẩm Rosso C	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_TP8M	Phụ gia thực phẩm: Foco - TP8M	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_ENZY	Nguyên vật liệu thực phẩm TG-B Transglutaminase (Enzyme)	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_STPP	PGTP Sodium Tripolyphosphate (INS451(i)) (STPP)	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_SCC	Chất phụ gia thực phẩm - Sodium Carboxymethyl Cellulose (CMC)	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_SOER	Phụ gia thực phẩm Sodium Erythorbate	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_POSO	Phụ gia thực phẩm Potassium Sorbate	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_TP1	Phụ gia thực phẩm: Foco - TP1	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_SUPH	Phụ gia thực phẩm: Sun Phos 25 (25kg/thùng)	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_ELPF	Gia vị hỗn hợp dùng chế biến thực phẩm (Euro Liver Pate Favorit 181380)	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_EHCT	Gia vị hỗn hợp dùng chế biến thực phẩm (Euro Hotdog Combi Type MDM136231)	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_BONG	Phụ Gia thực phẩm Monosodium Glutamate Bột ngọt INS 621	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_COFI	Nguyên liệu thực phẩm: Collagen Fiber (Powder)	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_VWG	Nguyên liệu thực phẩm: Vital Wheat Gluten	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_K7	Hỗn hợp các chất hóa học dùng trong chế biến thực phẩm (Tari K7)	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	TBB	Tinh bột bắp - Maize Starch 25kg/bao	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_MEPL	Phụ gia thực phẩm (Meat Plus +400 - 20kg)	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_OFP	Phụ gia thực phẩm - Opti Form Powder ACE S61 25kg/Bao	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_CXNM	Chiết xuất nấm men HKT-SB0412	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_HULI	Hương tiêu P01	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_HNM	Hương nước mắm	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	OT	Ớt	GV	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	TOI	Tỏi	GV	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	DUONGPHEN	Đường phèn	GV	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	BOTHANH	Bột hành tím	GV	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	MUOI	Muối sấy	GV	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	DUONG	Đường	GV	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	BOTO	Bột tỏi	GV	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	NUMA	Nước mắm	GV	Lít	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	NUTU	Nước tương	GV	Lít	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	MOCNHI	Mộc nhĩ khô	GV	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	TIEU	Tiêu đen	GV	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	HANH	Củ hành tây	GV	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_NEO	Phụ gia thực phẩm neo beef flavour 258	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_CARAMEL	Phụ gia thực phẩm : Phẩm Màu Caramel - Caramel Color	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_CARMINE	Phụ gia thực phẩm Màu carmine 5%- Carmine Color 5%	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	BOTTIEU	Bột tiêu trắng	GV	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_S1000AF	Phụ gia thực phẩm: S1000AF NEM	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_AMINO	Phụ gia thực phẩm: AMINO_S	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_KCL	Phụ gia thực phẩm: KCL (kg/gói)	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_CAMEE	Phụ gia thực phẩm: STD - CAMEE COLOR	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_PRE4S	Phụ gia thực phẩm: Pre_4S	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	TUIPE	Túi PET//LLD//PA	BB	Túi	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_CEA	Phụ gia thực phẩm: CEAMGEL PLUS	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_N61	Phụ Gia Thực Phẩm: POLY N61* (kg/gói)	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	LAC	Lá chuối	BB	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	MANH	Màng nhựa	BB	m	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	BB_PATE	Túi pate	BB	Túi	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	BB_TNV	Túi Nem Chua Huế 430g Nền xanh viền vàng	BB	Túi	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	BB_TNX	Túi Nem Chua Huế Hút Nền 1 Màu  Xanh	BB	Túi	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	BB_TG	Túi giấy kraft	BB	Túi	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	DAKE	Dây kẹp chì E230	BB	Cái	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	MBB	Màng bao bì	BB	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	PG_NPP	Phụ Gia Thực Phẩm Neo Plus P	PG	kg	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	DAKE_1	Dây kẹp chì E230	BB	m	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	NHAN_DBND	Nhãn da bao nạc đỏ 500g	BB	Cái	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	NHAN_DB	Nhãn da bao trắng 500g	BB	Cái	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	NHAN_OX	Nhãn ớt xim 500g	BB	Cái	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
1	NHAN_GL2	Nhãn chả lụa Loại 2 500g	BB	Cái	152	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
\.


--
-- Data for Name: item_group; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.item_group (code, name, is_finished) FROM stdin;
Thành phẩm	Thành phẩm	t
NVLC	Nguyên vật liệu chính	f
PG	Phụ gia	f
GV	Gia vị	f
BB	Bao bì	f
Khác	Khác	f
\.


--
-- Data for Name: material_substitution; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.material_substitution (id, company_id, product_code, material_code, substitute_code, valid_from, valid_to, ratio, note) FROM stdin;
\.


--
-- Data for Name: opening_balance; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.opening_balance (company_id, period, item_code, qty, amount, warehouse) FROM stdin;
1	2026-10	BO	8543.1400	331490462.0000	155
1	2026-10	PATE1	22.5600	509458.0000	155
1	2026-10	PATE2	508.5300	9854023.0000	155
1	2026-10	GTMOC	728.7000	30042608.0000	155
1	2026-10	GTXAO	444.4000	21989446.0000	155
1	2026-10	GIOLUA1	524.5000	35853783.0000	155
1	2026-10	GIOLUA2	149.0000	6958480.0000	155
1	2026-10	DABAO	402.9000	18469233.0000	155
1	2026-10	DABAONAC	232.0000	17638515.0000	155
1	2026-10	NEM1	10298.1500	429172096.0000	155
1	2026-10	NEM2	3409.3300	148178250.0000	155
1	2026-10	BOVIEN	0.0000	0.0000	155
1	2026-10	CHALUA_OX	0.0000	0.0000	155
1	2026-10	DAU	12733.0000	509288096.0000	152
1	2026-10	BOMI	2507.0000	38316967.0000	152
1	2026-10	BONA	0.0000	0.0000	152
1	2026-10	TGA_X	329.0000	9212000.0000	152
1	2026-10	MUIHEO	19.5000	670645.0000	152
1	2026-10	TAHE	3013.9000	231557509.0000	152
1	2026-10	THHE	1006.5400	76517821.0000	152
1	2026-10	TIHE	280.0000	11760000.0000	152
1	2026-10	LUHE	520.0000	33343348.0000	152
1	2026-10	DNCA	3935.0000	154621036.0000	152
1	2026-10	THGA	1002.0000	50526929.0000	152
1	2026-10	DAHE	851.7000	26732302.0000	152
1	2026-10	DECA	1558.0000	46000175.0000	152
1	2026-10	GAHE	12480.0000	180472152.0000	152
1	2026-10	TRGA	41380.0000	86150710.0000	152
1	2026-10	CHCA	6690.0000	267638981.0000	152
1	2026-10	MOHE	1.9000	44840.0000	152
1	2026-10	PG_PM	7.6000	1125925.0000	152
1	2026-10	PG_DAI	1.0500	136111.0000	152
1	2026-10	PG_GION	1.0500	110833.0000	152
1	2026-10	PG_ACSO	5.5700	670463.0000	152
1	2026-10	PG_GDL	51.4600	5862807.0000	152
1	2026-10	PG_TP2	0.0000	0.0000	152
1	2026-10	PG_HHQ	18.3600	4548659.0000	152
1	2026-10	PG_HUTH	69.2100	16574832.0000	152
1	2026-10	MUIHEO1	67.2500	14425125.0000	152
1	2026-10	PG_ROSSOC	98.0300	101206898.0000	152
1	2026-10	PG_TP8M	76.0000	6351576.0000	152
1	2026-10	PG_ENZY	30.2100	3774719.0000	152
1	2026-10	PG_STPP	159.0000	12219444.0000	152
1	2026-10	PG_SCC	306.0000	32583333.0000	152
1	2026-10	PG_SOER	53.9500	7965799.0000	152
1	2026-10	PG_POSO	98.1700	9544306.0000	152
1	2026-10	PG_TP1	194.8200	12693618.0000	152
1	2026-10	PG_SUPH	423.5000	57643055.0000	152
1	2026-10	PG_ELPF	289.2000	144600000.0000	152
1	2026-10	PG_EHCT	452.4000	226200000.0000	152
1	2026-10	PG_BONG	199.9600	7128204.0000	152
1	2026-10	PG_COFI	458.5000	86281365.0000	152
1	2026-10	PG_VWG	1569.0000	71454267.0000	152
1	2026-10	PG_K7	723.5000	127282461.0000	152
1	2026-10	TBB	1997.0000	49750227.0000	152
1	2026-10	PG_MEPL	548.5000	77964434.0000	152
1	2026-10	PG_OFP	193.9700	28103483.0000	152
1	2026-10	PG_CXNM	0.0000	0.0000	152
1	2026-10	PG_HULI	0.0000	0.0000	152
1	2026-10	PG_HNM	0.0000	0.0000	152
1	2026-10	OT	491.0000	22566981.0000	152
1	2026-10	TOI	1890.9000	61687476.0000	152
1	2026-10	DUONGPHEN	782.5000	16414705.0000	152
1	2026-10	BOTHANH	22.5000	2001852.0000	152
1	2026-10	MUOI	143.2000	466714.0000	152
1	2026-10	DUONG	9713.2600	167193311.0000	152
1	2026-10	BOTO	13.1000	1393159.0000	152
1	2026-10	NUMA	77.1000	1434060.0000	152
1	2026-10	NUTU	0.0000	0.0000	152
1	2026-10	MOCNHI	85.8400	5896588.0000	152
1	2026-10	TIEU	0.0000	0.0000	152
1	2026-10	HANH	1040.0000	13679419.0000	152
1	2026-10	PG_NEO	2.5000	462963.0000	152
1	2026-10	PG_CARAMEL	2.0000	92593.0000	152
1	2026-10	PG_CARMINE	0.0000	0.0000	152
1	2026-10	BOTTIEU	0.0000	0.0000	152
1	2026-10	PG_S1000AF	0.0000	0.0000	152
1	2026-10	PG_AMINO	0.0000	0.0000	152
1	2026-10	PG_KCL	0.0000	0.0000	152
1	2026-10	PG_CAMEE	0.0000	0.0000	152
1	2026-10	PG_PRE4S	0.0000	0.0000	152
1	2026-10	TUIPE	54940.0000	40493324.0000	152
1	2026-10	PG_CEA	0.0000	0.0000	152
1	2026-10	PG_N61	0.0000	0.0000	152
1	2026-10	LAC	1421.0000	17052000.0000	152
1	2026-10	MANH	50760.0000	147151529.0000	152
1	2026-10	BB_PATE	34880.0000	22281344.0000	152
1	2026-10	BB_TNV	0.0000	0.0000	152
1	2026-10	BB_TNX	99900.0000	45362187.0000	152
1	2026-10	BB_TG	16079.0000	3124926.0000	152
1	2026-10	DAKE	143555.0000	20559194.0000	152
1	2026-10	MBB	14.6200	1637982.0000	152
1	2026-10	PG_NPP	29.0000	3759259.0000	152
1	2026-10	DAKE_1	69017.3200	234658888.0000	152
1	2026-10	NHAN_DBND	3697.0000	1774560.0000	152
1	2026-10	NHAN_DB	0.0000	0.0000	152
1	2026-10	NHAN_OX	4257.0000	2043360.0000	152
1	2026-10	NHAN_GL2	7223.0000	3467040.0000	152
\.


--
-- Data for Name: order_material_adjustment; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.order_material_adjustment (id, company_id, order_id, item_code, adjustment_qty, reason) FROM stdin;
1	1	2	MOHE	-120.0000	\N
2	1	2	BONA	-30.0000	\N
3	1	3	MUIHEO	-60.0000	\N
4	1	3	PG_TP2	-1.9200	\N
5	1	3	PG_GION	-0.3000	\N
6	1	4	MOHE	-16.0000	\N
7	1	4	PG_TP2	-0.3400	\N
8	1	5	MUIHEO	-15.5000	\N
9	1	5	PG_TP2	-0.8800	\N
10	1	5	TIEU	-0.1000	\N
11	1	5	NHAN_DB	-500.0000	\N
12	1	6	TIEU	-10.0000	\N
13	1	7	MOHE	-118.1000	\N
14	1	7	BONA	-5.0000	\N
15	1	9	MOHE	-120.0000	\N
16	1	9	BONA	-5.0000	\N
17	1	10	MOHE	-120.0000	\N
18	1	10	BONA	-30.0000	\N
19	1	11	MUIHEO	-80.0000	\N
20	1	11	PG_TP2	-2.5600	\N
21	1	11	PG_GION	-1.1000	\N
22	1	12	MUIHEO	-35.0000	\N
23	1	12	BB_TG	-600.0000	\N
24	1	12	PG_TP2	-0.8800	\N
25	1	12	PG_GION	-0.3800	\N
26	1	12	TIEU	-0.1000	\N
27	1	12	NHAN_DB	-500.0000	\N
28	1	13	TIEU	-12.0000	\N
29	1	13	BB_TG	-1571.0000	\N
30	1	15	MOHE	-120.0000	\N
31	1	15	BONA	-5.0000	\N
32	1	16	MOHE	-120.0000	\N
33	1	16	BONA	-30.0000	\N
34	1	18	BB_TG	-1800.0000	\N
35	1	18	TIEU	-0.3000	\N
36	1	18	NHAN_DB	-1500.0000	\N
37	1	19	TIEU	-10.0000	\N
38	1	19	BB_TG	-7750.0000	\N
39	1	20	MOHE	-16.0000	\N
40	1	22	MOHE	-120.0000	\N
41	1	22	BONA	-30.0000	\N
42	1	23	MOHE	-16.0000	\N
43	1	24	TIHE	-35.0000	\N
44	1	24	BB_TG	-1200.0000	\N
45	1	24	TIEU	-0.2000	\N
46	1	24	NHAN_DB	-1000.0000	\N
47	1	25	TIEU	-10.0000	\N
48	1	25	BB_TG	-7750.0000	\N
49	1	26	PG_ACSO	-0.3600	\N
50	1	27	MOHE	-120.0000	\N
51	1	27	BONA	-30.0000	\N
52	1	28	MOHE	-16.0000	\N
53	1	28	PG_ACSO	-0.0800	\N
54	1	29	TIHE	-45.0000	\N
55	1	29	BB_TG	-600.0000	\N
56	1	29	TIEU	-0.1000	\N
57	1	29	PG_ACSO	-0.1100	\N
58	1	29	NHAN_DB	-500.0000	\N
59	1	30	TIEU	-12.0000	\N
60	1	30	BB_TG	-9300.0000	\N
61	1	31	PG_ACSO	-0.3200	\N
62	1	32	MOHE	-120.0000	\N
63	1	32	BONA	-30.0000	\N
64	1	33	MOHE	-8.0000	\N
65	1	33	PG_ACSO	-0.0400	\N
66	1	34	TIEU	-10.0000	\N
67	1	34	BB_TG	-7750.0000	\N
68	1	34	PG_ACSO	-0.4200	\N
69	1	35	PG_ACSO	-0.3200	\N
70	1	36	MOHE	-120.0000	\N
71	1	36	BONA	-30.0000	\N
72	1	37	MOHE	-16.0000	\N
73	1	37	PG_ACSO	-0.0800	\N
74	1	38	TIHE	-45.0000	\N
75	1	38	BB_TG	-600.0000	\N
76	1	38	TIEU	-0.1000	\N
77	1	38	PG_ACSO	-0.1300	\N
78	1	38	NHAN_DB	-500.0000	\N
79	1	39	TIEU	-8.0000	\N
80	1	39	BB_TG	-6200.0000	\N
81	1	39	PG_ACSO	-0.3300	\N
82	1	40	MOHE	-120.0000	\N
83	1	40	BONA	-5.0000	\N
84	1	41	PG_ACSO	-0.3200	\N
85	1	42	MOHE	-120.0000	\N
86	1	42	BONA	-30.0000	\N
87	1	43	MOHE	-24.0000	\N
88	1	43	PG_ACSO	-0.1200	\N
89	1	44	TIHE	-45.0000	\N
90	1	44	BB_TG	-600.0000	\N
91	1	44	TIEU	-0.1000	\N
92	1	44	PG_ACSO	-0.1300	\N
93	1	44	NHAN_DB	-500.0000	\N
94	1	45	TIEU	-8.0000	\N
95	1	45	BB_TG	-6200.0000	\N
96	1	45	PG_ACSO	-0.3300	\N
97	1	46	PG_ACSO	-0.3200	\N
98	1	47	MOHE	-120.0000	\N
99	1	47	BONA	-5.0000	\N
100	1	48	MOHE	-120.0000	\N
101	1	48	BONA	-30.0000	\N
102	1	49	THGA	-18.0000	\N
103	1	49	PG_ACSO	-0.1900	\N
104	1	50	THGA	-24.0000	\N
105	1	50	MOHE	-16.0000	\N
106	1	50	PG_ACSO	-0.0800	\N
107	1	51	THGA	-40.5000	\N
108	1	51	BB_TNV	-1550.0000	\N
109	1	51	TIEU	-2.0000	\N
110	1	51	BB_TG	-1550.0000	\N
111	1	51	PG_ACSO	-0.0800	\N
112	1	52	THGA	-38.5000	\N
113	1	52	TIEU	-6.0000	\N
114	1	52	BB_TG	-4650.0000	\N
115	1	52	PG_ACSO	-0.2500	\N
116	1	53	PG_ACSO	-0.3200	\N
117	1	54	MOHE	-120.0000	\N
118	1	54	BONA	-30.0000	\N
119	1	55	THGA	-24.0000	\N
120	1	55	MOHE	-16.0000	\N
121	1	55	PG_ACSO	-0.0800	\N
122	1	56	THGA	-56.5000	\N
123	1	56	TIEU	-6.0000	\N
124	1	56	BB_TG	-2450.0000	\N
125	1	56	PG_ACSO	-0.2500	\N
126	1	58	MOHE	-120.0000	\N
127	1	58	BONA	-30.0000	\N
128	1	59	TIEU	-6.0000	\N
129	1	62	MOHE	-4.0000	\N
130	1	63	TIEU	-0.1000	\N
131	1	63	NHAN_DB	-500.0000	\N
132	1	64	TIEU	-10.0000	\N
133	1	65	MOHE	-120.0000	\N
134	1	65	BONA	-5.0000	\N
135	1	67	TIEU	-0.5000	\N
136	1	67	PG_HNM	-0.1500	\N
137	1	68	TIEU	-0.1000	\N
138	1	68	NHAN_DB	-500.0000	\N
139	1	69	TIEU	-8.0000	\N
140	1	70	BONA	-5.0000	\N
141	1	72	PG_ENZY	-0.0100	\N
142	1	72	TIEU	-0.1000	\N
143	1	72	NHAN_DB	-500.0000	\N
144	1	73	TIEU	-8.0000	\N
145	1	75	BB_TNX	-850.0000	\N
146	1	75	TIEU	-6.0000	\N
147	1	77	MOHE	-106.0000	\N
148	1	77	BONA	-10.0000	\N
149	1	80	NUTU	-0.2000	\N
150	1	81	BONA	-30.0000	\N
151	1	83	MOHE	-120.0000	\N
152	1	83	BONA	-5.0000	\N
153	1	84	MUIHEO	-30.0000	\N
154	1	85	MOHE	-16.0000	\N
155	1	86	TIEU	-0.1000	\N
156	1	86	NHAN_DB	-500.0000	\N
157	1	88	BONA	-60.0000	\N
158	1	89	MUIHEO	-60.0000	\N
159	1	91	MUIHEO	-70.0000	\N
160	1	91	TIEU	-0.2000	\N
161	1	91	NHAN_DB	-1000.0000	\N
162	1	92	BB_TNX	-4650.0000	\N
163	1	92	TIEU	-6.0000	\N
164	1	94	BONA	-30.0000	\N
165	1	95	MUIHEO	-60.0000	\N
166	1	95	PG_TP2	-1.9200	\N
167	1	96	PG_TP2	-0.1700	\N
168	1	97	MUIHEO	-35.0000	\N
169	1	97	PG_TP2	-0.0500	\N
170	1	97	TIEU	-0.1000	\N
171	1	97	NHAN_DB	-500.0000	\N
172	1	98	MUIHEO	-30.0000	\N
173	1	98	NUTU	-0.2000	\N
174	1	101	MUIHEO	-60.0000	\N
175	1	101	PG_TP2	-1.2800	\N
176	1	103	MUIHEO	-35.0000	\N
177	1	103	TIEU	-0.1000	\N
178	1	103	NHAN_DB	-500.0000	\N
179	1	106	MUIHEO	-60.0000	\N
180	1	106	PG_NPP	-1.5000	\N
181	1	106	PG_GION	-0.3900	\N
182	1	108	TIHE	-5.0000	\N
183	1	108	MUIHEO	-35.0000	\N
184	1	108	PG_NPP	-0.2500	\N
185	1	108	TIEU	-0.1000	\N
186	1	108	NHAN_DB	-500.0000	\N
187	1	110	BONA	-30.0000	\N
188	1	111	PG_ACSO	-0.3200	\N
189	1	112	MUIHEO	-20.0000	\N
190	1	112	PG_NPP	-0.5000	\N
191	1	112	PG_GION	-0.2800	\N
192	1	112	PG_ACSO	-0.1000	\N
193	1	113	PG_GION	-0.0700	\N
194	1	113	PG_ACSO	-0.0400	\N
195	1	114	TIHE	-45.0000	\N
196	1	114	MUIHEO	-35.0000	\N
197	1	114	PG_NPP	-0.7500	\N
198	1	114	PG_GION	-0.3800	\N
199	1	114	TIEU	-0.1000	\N
200	1	114	PG_ACSO	-0.1200	\N
201	1	114	NHAN_DB	-500.0000	\N
202	1	115	BB_TNX	-4650.0000	\N
203	1	115	TIEU	-6.0000	\N
204	1	116	PG_GION	-0.0100	\N
205	1	117	PG_ACSO	-0.3200	\N
206	1	118	MOHE	-8.0000	\N
207	1	118	PG_GION	-0.0700	\N
208	1	118	PG_ACSO	-0.0400	\N
209	1	119	TIHE	-45.0000	\N
210	1	119	MUIHEO	-35.0000	\N
211	1	119	PG_NPP	-0.7500	\N
212	1	119	PG_GION	-0.3800	\N
213	1	119	TIEU	-0.1000	\N
214	1	119	PG_ACSO	-0.1300	\N
215	1	119	NHAN_DB	-500.0000	\N
216	1	120	MOHE	-4.0000	\N
217	1	120	PG_ACSO	-0.0400	\N
218	1	120	PG_GION	-0.0100	\N
219	1	121	MOHE	-120.0000	\N
220	1	121	BONA	-30.0000	\N
221	1	122	MOHE	-68.7000	\N
222	1	122	BONA	-5.0000	\N
223	1	123	MOHE	-120.0000	\N
224	1	123	BONA	-30.0000	\N
225	1	124	PG_ACSO	-0.3200	\N
226	1	125	TIHE	-45.0000	\N
227	1	125	MUIHEO	-35.0000	\N
228	1	125	PG_NPP	-0.7500	\N
229	1	125	PG_GION	-0.3800	\N
230	1	125	TIEU	-0.1000	\N
231	1	125	PG_ACSO	-0.1300	\N
232	1	125	NHAN_DB	-500.0000	\N
233	1	126	MOHE	-4.0000	\N
234	1	126	PG_ACSO	-0.0400	\N
235	1	126	PG_GION	-0.0100	\N
236	1	127	PG_ACSO	-0.3200	\N
237	1	128	TIHE	-45.0000	\N
238	1	128	MUIHEO	-35.0000	\N
239	1	128	PG_NPP	-0.7500	\N
240	1	128	PG_GION	-0.3800	\N
241	1	128	TIEU	-0.1000	\N
242	1	128	PG_ACSO	-0.1300	\N
243	1	128	NHAN_DB	-500.0000	\N
244	1	129	BB_TNX	-4650.0000	\N
245	1	129	TIEU	-6.0000	\N
246	1	129	PG_ACSO	-0.2500	\N
247	1	130	MOHE	-4.0000	\N
248	1	130	PG_ACSO	-0.0400	\N
249	1	130	PG_GION	-0.0100	\N
\.


--
-- Data for Name: period_cost; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.period_cost (company_id, period, cost_code, amount) FROM stdin;
1	2026-05	c622	81129000.0000
1	2026-05	dien	53965255.0000
1	2026-05	nuoc	858390.0000
1	2026-05	khac	20000000.0000
1	2026-06	c622	99032000.0000
1	2026-06	dien	53396819.0000
1	2026-06	nuoc	858390.0000
1	2026-06	khac	69000000.0000
1	2026-07	c622	119524000.0000
1	2026-07	c6274	4229167.0000
1	2026-07	dien	54354870.0000
1	2026-07	nuoc	2769000.0000
1	2026-07	khac	69000000.0000
1	2026-08	c622	118435000.0000
1	2026-08	c6274	4229167.0000
1	2026-08	dien	53407961.0000
1	2026-08	nuoc	2741310.0000
1	2026-08	khac	69000000.0000
1	2026-09	c622	116714000.0000
1	2026-09	c6274	4229167.0000
1	2026-09	dien	47025890.0000
1	2026-09	khac	69000000.0000
1	2026-10	khac	94000000.0000
\.


--
-- Data for Name: period_lock; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.period_lock (company_id, period, locked_at, locked_by) FROM stdin;
\.


--
-- Data for Name: production_capacity; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.production_capacity (id, company_id, product_code, valid_from, valid_to, runs_per_day, runs_per_month, note) FROM stdin;
\.


--
-- Data for Name: production_order; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.production_order (id, company_id, order_code, material_issue_date, production_date, product_code, bom_type, planned_batches, batch_adjustment, proposed_batches, note, created_at, updated_at) FROM stdin;
1	1	LSX2026-10.01-01	2026-10-01	2026-10-01	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
2	1	LSX2026-10.01-02	2026-10-01	2026-10-01	PATE2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
3	1	LSX2026-10.01-03	2026-10-01	2026-10-01	GTMOC	DM	3.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
4	1	LSX2026-10.01-04	2026-10-01	2026-10-01	GIOLUA2	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
5	1	LSX2026-10.01-05	2026-10-01	2026-10-01	DABAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
6	1	LSX2026-10.01-06	2026-10-01	2026-10-01	NEM2	DM	5.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
7	1	LSX2026-10.01-07	2026-10-01	2026-10-01	PATE1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
8	1	LSX2026-10.02-01	2026-10-02	2026-10-02	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
9	1	LSX2026-10.02-02	2026-10-02	2026-10-02	PATE1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
10	1	LSX2026-10.02-03	2026-10-02	2026-10-02	PATE2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
11	1	LSX2026-10.02-04	2026-10-02	2026-10-02	GTMOC	DM	4.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
12	1	LSX2026-10.02-05	2026-10-02	2026-10-02	DABAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
13	1	LSX2026-10.02-06	2026-10-02	2026-10-02	NEM2	DM	6.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
14	1	LSX2026-10.03-01	2026-10-03	2026-10-03	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
15	1	LSX2026-10.03-02	2026-10-03	2026-10-03	PATE1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
16	1	LSX2026-10.03-03	2026-10-03	2026-10-03	PATE2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
17	1	LSX2026-10.03-04	2026-10-03	2026-10-03	GTMOC	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
18	1	LSX2026-10.03-05	2026-10-03	2026-10-03	DABAO	DM	3.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
19	1	LSX2026-10.03-06	2026-10-03	2026-10-03	NEM2	DM	5.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
20	1	LSX2026-10.03-07	2026-10-03	2026-10-03	GIOLUA2	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
21	1	LSX2026-10.06-01	2026-10-06	2026-10-06	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
22	1	LSX2026-10.06-02	2026-10-06	2026-10-06	PATE2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
23	1	LSX2026-10.06-03	2026-10-06	2026-10-06	GIOLUA2	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
24	1	LSX2026-10.06-04	2026-10-06	2026-10-06	DABAO	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
25	1	LSX2026-10.06-05	2026-10-06	2026-10-06	NEM2	DM	5.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
26	1	LSX2026-10.07-01	2026-10-07	2026-10-07	BO	DM	18.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
27	1	LSX2026-10.07-02	2026-10-07	2026-10-07	PATE2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
28	1	LSX2026-10.07-03	2026-10-07	2026-10-07	GIOLUA2	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
29	1	LSX2026-10.07-04	2026-10-07	2026-10-07	DABAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
30	1	LSX2026-10.07-05	2026-10-07	2026-10-07	NEM2	DM	6.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
31	1	LSX2026-10.08-01	2026-10-08	2026-10-08	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
32	1	LSX2026-10.08-02	2026-10-08	2026-10-08	PATE2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
33	1	LSX2026-10.08-03	2026-10-08	2026-10-08	GIOLUA2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
34	1	LSX2026-10.08-04	2026-10-08	2026-10-08	NEM2	DM	5.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
35	1	LSX2026-10.09-01	2026-10-09	2026-10-09	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
36	1	LSX2026-10.09-02	2026-10-09	2026-10-09	PATE2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
37	1	LSX2026-10.09-03	2026-10-09	2026-10-09	GIOLUA2	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
38	1	LSX2026-10.09-04	2026-10-09	2026-10-09	DABAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
39	1	LSX2026-10.09-05	2026-10-09	2026-10-09	NEM2	DM	4.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
40	1	LSX2026-10.09-06	2026-10-09	2026-10-09	PATE1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
41	1	LSX2026-10.10-01	2026-10-10	2026-10-10	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
42	1	LSX2026-10.10-02	2026-10-10	2026-10-10	PATE2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
43	1	LSX2026-10.10-03	2026-10-10	2026-10-10	GIOLUA2	DM	3.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
44	1	LSX2026-10.10-04	2026-10-10	2026-10-10	DABAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
45	1	LSX2026-10.10-05	2026-10-10	2026-10-10	NEM2	DM	4.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
46	1	LSX2026-10.11-01	2026-10-11	2026-10-11	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
47	1	LSX2026-10.11-02	2026-10-11	2026-10-11	PATE1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
48	1	LSX2026-10.11-03	2026-10-11	2026-10-11	PATE2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
49	1	LSX2026-10.11-04	2026-10-11	2026-10-11	GTMOC	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
50	1	LSX2026-10.11-05	2026-10-11	2026-10-11	GIOLUA2	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
51	1	LSX2026-10.11-06	2026-10-11	2026-10-11	NEM1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
52	1	LSX2026-10.11-07	2026-10-11	2026-10-11	NEM2	DM	3.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
53	1	LSX2026-10.12-01	2026-10-12	2026-10-12	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
54	1	LSX2026-10.12-02	2026-10-12	2026-10-12	PATE2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
55	1	LSX2026-10.12-03	2026-10-12	2026-10-12	GIOLUA2	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
56	1	LSX2026-10.12-04	2026-10-12	2026-10-12	NEM2	DM	3.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
57	1	LSX2026-10.13-01	2026-10-13	2026-10-13	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
58	1	LSX2026-10.13-02	2026-10-13	2026-10-13	PATE2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
59	1	LSX2026-10.13-03	2026-10-13	2026-10-13	NEM2	DM	3.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
60	1	LSX2026-10.13-04	2026-10-13	2026-10-13	GTMOC	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
61	1	LSX2026-10.14-01	2026-10-14	2026-10-14	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
62	1	LSX2026-10.14-02	2026-10-14	2026-10-14	GIOLUA1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
63	1	LSX2026-10.14-03	2026-10-14	2026-10-14	DABAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
64	1	LSX2026-10.14-04	2026-10-14	2026-10-14	NEM2	DM	5.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
65	1	LSX2026-10.14-05	2026-10-14	2026-10-14	PATE1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
66	1	LSX2026-10.15-01	2026-10-15	2026-10-15	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
67	1	LSX2026-10.15-02	2026-10-15	2026-10-15	DABAONAC	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
68	1	LSX2026-10.15-03	2026-10-15	2026-10-15	DABAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
69	1	LSX2026-10.15-04	2026-10-15	2026-10-15	NEM2	DM	4.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
70	1	LSX2026-10.15-05	2026-10-15	2026-10-15	PATE1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
71	1	LSX2026-10.16-01	2026-10-16	2026-10-16	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
72	1	LSX2026-10.16-02	2026-10-16	2026-10-16	DABAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
73	1	LSX2026-10.16-03	2026-10-16	2026-10-16	NEM2	DM	4.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
74	1	LSX2026-10.17-01	2026-10-17	2026-10-17	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
75	1	LSX2026-10.17-02	2026-10-17	2026-10-17	NEM2	DM	3.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
76	1	LSX2026-10.19-01	2026-10-19	2026-10-19	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
77	1	LSX2026-10.19-02	2026-10-19	2026-10-19	PATE1	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
78	1	LSX2026-10.19-03	2026-10-19	2026-10-19	GTMOC	DM	3.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
79	1	LSX2026-10.19-04	2026-10-19	2026-10-19	GIOLUA2	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
80	1	LSX2026-10.19-05	2026-10-19	2026-10-19	GTXAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
81	1	LSX2026-10.19-06	2026-10-19	2026-10-19	PATE2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
82	1	LSX2026-10.20-01	2026-10-20	2026-10-20	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
83	1	LSX2026-10.20-02	2026-10-20	2026-10-20	PATE1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
84	1	LSX2026-10.20-03	2026-10-20	2026-10-20	GTMOC	DM	3.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
85	1	LSX2026-10.20-04	2026-10-20	2026-10-20	GIOLUA2	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
86	1	LSX2026-10.20-05	2026-10-20	2026-10-20	DABAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
87	1	LSX2026-10.21-01	2026-10-21	2026-10-21	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
88	1	LSX2026-10.21-02	2026-10-21	2026-10-21	PATE2	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
89	1	LSX2026-10.21-03	2026-10-21	2026-10-21	GTMOC	DM	3.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
90	1	LSX2026-10.21-04	2026-10-21	2026-10-21	GIOLUA2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
91	1	LSX2026-10.21-05	2026-10-21	2026-10-21	DABAO	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
92	1	LSX2026-10.21-06	2026-10-21	2026-10-21	NEM2	DM	3.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
93	1	LSX2026-10.22-01	2026-10-22	2026-10-22	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
94	1	LSX2026-10.22-02	2026-10-22	2026-10-22	PATE2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
95	1	LSX2026-10.22-03	2026-10-22	2026-10-22	GTMOC	DM	3.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
96	1	LSX2026-10.22-04	2026-10-22	2026-10-22	GIOLUA2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
97	1	LSX2026-10.22-05	2026-10-22	2026-10-22	DABAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
98	1	LSX2026-10.22-06	2026-10-22	2026-10-22	GTXAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
99	1	LSX2026-10.22-07	2026-10-22	2026-10-22	GIOLUA1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
100	1	LSX2026-10.23-01	2026-10-23	2026-10-23	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
101	1	LSX2026-10.23-02	2026-10-23	2026-10-23	GTMOC	DM	3.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
102	1	LSX2026-10.23-03	2026-10-23	2026-10-23	GIOLUA2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
103	1	LSX2026-10.23-04	2026-10-23	2026-10-23	DABAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
104	1	LSX2026-10.23-05	2026-10-23	2026-10-23	GIOLUA1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
105	1	LSX2026-10.24-01	2026-10-24	2026-10-24	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
106	1	LSX2026-10.24-02	2026-10-24	2026-10-24	GTMOC	DM	3.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
107	1	LSX2026-10.24-03	2026-10-24	2026-10-24	GIOLUA2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
108	1	LSX2026-10.24-04	2026-10-24	2026-10-24	DABAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
109	1	LSX2026-10.24-05	2026-10-24	2026-10-24	GIOLUA1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
110	1	LSX2026-10.24-06	2026-10-24	2026-10-24	PATE2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
111	1	LSX2026-10.26-01	2026-10-26	2026-10-26	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
112	1	LSX2026-10.26-02	2026-10-26	2026-10-26	GTMOC	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
113	1	LSX2026-10.26-03	2026-10-26	2026-10-26	GIOLUA2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
114	1	LSX2026-10.26-04	2026-10-26	2026-10-26	DABAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
115	1	LSX2026-10.26-05	2026-10-26	2026-10-26	NEM2	DM	3.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
116	1	LSX2026-10.26-06	2026-10-26	2026-10-26	GIOLUA1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
117	1	LSX2026-10.27-01	2026-10-27	2026-10-27	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
118	1	LSX2026-10.27-02	2026-10-27	2026-10-27	GIOLUA2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
119	1	LSX2026-10.27-03	2026-10-27	2026-10-27	DABAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
120	1	LSX2026-10.27-04	2026-10-27	2026-10-27	GIOLUA1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
121	1	LSX2026-10.27-05	2026-10-27	2026-10-27	PATE2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
122	1	LSX2026-10.27-06	2026-10-27	2026-10-27	PATE1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
123	1	LSX2026-10.28-01	2026-10-28	2026-10-28	PATE2	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
124	1	LSX2026-10.28-02	2026-10-28	2026-10-28	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
125	1	LSX2026-10.28-03	2026-10-28	2026-10-28	DABAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
126	1	LSX2026-10.28-04	2026-10-28	2026-10-28	GIOLUA1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
127	1	LSX2026-10.29-01	2026-10-29	2026-10-29	BO	DM	16.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
128	1	LSX2026-10.29-02	2026-10-29	2026-10-29	DABAO	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
129	1	LSX2026-10.29-03	2026-10-29	2026-10-29	NEM2	DM	3.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
130	1	LSX2026-10.29-04	2026-10-29	2026-10-29	GIOLUA1	DM	1.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
131	1	LSX2026-10.15-06	2026-10-15	2026-10-15	GTMOC	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
132	1	LSX2026-10.16-04	2026-10-16	2026-10-16	GTMOC	DM	2.0000	0.0000	0.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
\.


--
-- Data for Name: production_plan; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.production_plan (id, company_id, production_date, product_code, batches, note) FROM stdin;
1	1	2026-10-01	BO	12.0000	\N
2	1	2026-10-01	PATE2	1.0000	\N
3	1	2026-10-01	GTMOC	3.0000	\N
4	1	2026-10-01	GIOLUA2	2.0000	\N
5	1	2026-10-01	DABAO	1.0000	\N
6	1	2026-10-01	NEM1	2.0000	\N
7	1	2026-10-01	NEM2	5.0000	\N
8	1	2026-10-01	PATE1	1.0000	\N
9	1	2026-10-02	BO	15.0000	\N
10	1	2026-10-02	PATE1	1.0000	\N
11	1	2026-10-02	PATE2	1.0000	\N
12	1	2026-10-02	GTMOC	4.0000	\N
13	1	2026-10-02	DABAO	1.0000	\N
14	1	2026-10-02	NEM1	2.0000	\N
15	1	2026-10-02	NEM2	6.0000	\N
16	1	2026-10-03	BO	12.0000	\N
17	1	2026-10-03	PATE1	1.0000	\N
18	1	2026-10-03	PATE2	1.0000	\N
19	1	2026-10-03	GTMOC	4.0000	\N
20	1	2026-10-03	DABAO	3.0000	\N
21	1	2026-10-03	NEM1	2.0000	\N
22	1	2026-10-03	NEM2	5.0000	\N
23	1	2026-10-03	GIOLUA2	2.0000	\N
24	1	2026-10-06	BO	15.0000	\N
25	1	2026-10-06	PATE1	1.0000	\N
26	1	2026-10-06	PATE2	1.0000	\N
27	1	2026-10-06	GTMOC	3.0000	\N
28	1	2026-10-06	GIOLUA2	2.0000	\N
29	1	2026-10-06	DABAO	2.0000	\N
30	1	2026-10-06	NEM1	2.0000	\N
31	1	2026-10-06	NEM2	5.0000	\N
32	1	2026-10-07	BO	18.0000	\N
33	1	2026-10-07	PATE1	1.0000	\N
34	1	2026-10-07	PATE2	1.0000	\N
35	1	2026-10-07	GTMOC	3.0000	\N
36	1	2026-10-07	GIOLUA2	2.0000	\N
37	1	2026-10-07	DABAO	1.0000	\N
38	1	2026-10-07	NEM1	1.0000	\N
39	1	2026-10-07	NEM2	6.0000	\N
40	1	2026-10-08	BO	16.0000	\N
41	1	2026-10-08	PATE2	1.0000	\N
42	1	2026-10-08	GTMOC	3.0000	\N
43	1	2026-10-08	GIOLUA2	1.0000	\N
44	1	2026-10-08	NEM2	5.0000	\N
45	1	2026-10-09	BO	15.0000	\N
46	1	2026-10-09	PATE1	1.0000	\N
47	1	2026-10-09	PATE2	1.0000	\N
48	1	2026-10-09	GTMOC	3.0000	\N
49	1	2026-10-09	GIOLUA2	2.0000	\N
50	1	2026-10-09	DABAO	1.0000	\N
51	1	2026-10-09	NEM1	1.0000	\N
52	1	2026-10-09	NEM2	4.0000	\N
53	1	2026-10-10	BO	16.0000	\N
54	1	2026-10-10	PATE1	1.0000	\N
55	1	2026-10-10	PATE2	1.0000	\N
56	1	2026-10-10	GTMOC	2.0000	\N
57	1	2026-10-10	GIOLUA2	3.0000	\N
58	1	2026-10-10	DABAO	1.0000	\N
59	1	2026-10-10	NEM1	2.0000	\N
60	1	2026-10-10	NEM2	4.0000	\N
61	1	2026-10-11	BO	16.0000	\N
62	1	2026-10-11	PATE1	1.0000	\N
63	1	2026-10-11	PATE2	1.0000	\N
64	1	2026-10-11	GTMOC	2.0000	\N
65	1	2026-10-11	GIOLUA2	2.0000	\N
66	1	2026-10-11	NEM1	1.0000	\N
67	1	2026-10-11	NEM2	3.0000	\N
68	1	2026-10-12	BO	16.0000	\N
69	1	2026-10-12	PATE2	1.0000	\N
70	1	2026-10-12	GTMOC	2.0000	\N
71	1	2026-10-12	GIOLUA2	2.0000	\N
72	1	2026-10-12	NEM1	1.0000	\N
73	1	2026-10-12	NEM2	3.0000	\N
74	1	2026-10-12	GTXAO	1.0000	\N
75	1	2026-10-13	BO	16.0000	\N
76	1	2026-10-13	PATE2	1.0000	\N
77	1	2026-10-13	GTMOC	2.0000	\N
78	1	2026-10-13	GIOLUA2	2.0000	\N
79	1	2026-10-13	NEM1	1.0000	\N
80	1	2026-10-13	NEM2	3.0000	\N
81	1	2026-10-14	BO	15.0000	\N
82	1	2026-10-14	PATE1	1.0000	\N
83	1	2026-10-14	PATE2	1.0000	\N
84	1	2026-10-14	GTMOC	2.0000	\N
85	1	2026-10-14	GIOLUA1	1.0000	\N
86	1	2026-10-14	GIOLUA2	1.0000	\N
87	1	2026-10-14	DABAO	1.0000	\N
88	1	2026-10-14	NEM1	2.0000	\N
89	1	2026-10-14	NEM2	5.0000	\N
90	1	2026-10-15	BO	16.0000	\N
91	1	2026-10-15	PATE1	1.0000	\N
92	1	2026-10-15	GTMOC	2.0000	\N
93	1	2026-10-15	DABAONAC	1.0000	\N
94	1	2026-10-15	GIOLUA2	1.0000	\N
95	1	2026-10-15	DABAO	1.0000	\N
96	1	2026-10-15	NEM1	1.0000	\N
97	1	2026-10-15	NEM2	4.0000	\N
98	1	2026-10-16	BO	16.0000	\N
99	1	2026-10-16	PATE2	1.0000	\N
100	1	2026-10-16	GTMOC	2.0000	\N
101	1	2026-10-16	GIOLUA2	1.0000	\N
102	1	2026-10-16	DABAO	1.0000	\N
103	1	2026-10-16	NEM1	1.0000	\N
104	1	2026-10-16	NEM2	4.0000	\N
105	1	2026-10-17	BO	16.0000	\N
106	1	2026-10-17	PATE2	1.0000	\N
107	1	2026-10-17	GTMOC	2.0000	\N
108	1	2026-10-17	GIOLUA2	1.0000	\N
109	1	2026-10-17	DABAO	1.0000	\N
110	1	2026-10-17	NEM1	1.0000	\N
111	1	2026-10-17	NEM2	3.0000	\N
112	1	2026-10-19	BO	16.0000	\N
113	1	2026-10-19	PATE1	2.0000	\N
114	1	2026-10-19	PATE2	1.0000	\N
115	1	2026-10-19	GTMOC	3.0000	\N
116	1	2026-10-19	GIOLUA2	2.0000	\N
117	1	2026-10-19	DABAO	1.0000	\N
118	1	2026-10-19	NEM1	1.0000	\N
119	1	2026-10-19	NEM2	3.0000	\N
120	1	2026-10-19	GTXAO	1.0000	\N
121	1	2026-10-20	BO	16.0000	\N
122	1	2026-10-20	PATE1	1.0000	\N
123	1	2026-10-20	PATE2	1.0000	\N
124	1	2026-10-20	GTMOC	3.0000	\N
125	1	2026-10-20	GIOLUA2	2.0000	\N
126	1	2026-10-20	DABAO	1.0000	\N
127	1	2026-10-20	NEM2	3.0000	\N
128	1	2026-10-21	BO	16.0000	\N
129	1	2026-10-21	PATE1	1.0000	\N
130	1	2026-10-21	PATE2	2.0000	\N
131	1	2026-10-21	GTMOC	3.0000	\N
132	1	2026-10-21	GIOLUA2	1.0000	\N
133	1	2026-10-21	DABAO	2.0000	\N
134	1	2026-10-21	NEM2	3.0000	\N
135	1	2026-10-22	BO	16.0000	\N
136	1	2026-10-22	PATE1	1.0000	\N
137	1	2026-10-22	PATE2	1.0000	\N
138	1	2026-10-22	GTMOC	3.0000	\N
139	1	2026-10-22	GIOLUA2	1.0000	\N
140	1	2026-10-22	DABAO	1.0000	\N
141	1	2026-10-22	NEM1	1.0000	\N
142	1	2026-10-22	NEM2	2.0000	\N
143	1	2026-10-22	GTXAO	1.0000	\N
144	1	2026-10-22	GIOLUA1	1.0000	\N
145	1	2026-10-23	BO	16.0000	\N
146	1	2026-10-23	PATE1	2.0000	\N
147	1	2026-10-23	PATE2	2.0000	\N
148	1	2026-10-23	GTMOC	3.0000	\N
149	1	2026-10-23	GIOLUA2	1.0000	\N
150	1	2026-10-23	DABAO	1.0000	\N
151	1	2026-10-23	NEM1	2.0000	\N
152	1	2026-10-23	NEM2	3.0000	\N
153	1	2026-10-23	GIOLUA1	1.0000	\N
154	1	2026-10-24	BO	16.0000	\N
155	1	2026-10-24	PATE1	1.0000	\N
156	1	2026-10-24	PATE2	1.0000	\N
157	1	2026-10-24	GTMOC	3.0000	\N
158	1	2026-10-24	GIOLUA2	1.0000	\N
159	1	2026-10-24	DABAO	1.0000	\N
160	1	2026-10-24	NEM1	1.0000	\N
161	1	2026-10-24	NEM2	3.0000	\N
162	1	2026-10-24	GIOLUA1	1.0000	\N
163	1	2026-10-26	BO	16.0000	\N
164	1	2026-10-26	PATE1	1.0000	\N
165	1	2026-10-26	PATE2	1.0000	\N
166	1	2026-10-26	GTMOC	3.0000	\N
167	1	2026-10-26	GIOLUA2	1.0000	\N
168	1	2026-10-26	DABAO	1.0000	\N
169	1	2026-10-26	NEM1	1.0000	\N
170	1	2026-10-26	NEM2	3.0000	\N
171	1	2026-10-26	GIOLUA1	1.0000	\N
172	1	2026-10-27	BO	16.0000	\N
173	1	2026-10-27	PATE2	1.0000	\N
174	1	2026-10-27	PATE1	1.0000	\N
175	1	2026-10-27	GTMOC	3.0000	\N
176	1	2026-10-27	GIOLUA2	1.0000	\N
177	1	2026-10-27	DABAO	1.0000	\N
178	1	2026-10-27	NEM1	2.0000	\N
179	1	2026-10-27	NEM2	3.0000	\N
180	1	2026-10-27	GIOLUA1	1.0000	\N
181	1	2026-10-28	BO	16.0000	\N
182	1	2026-10-28	PATE2	1.0000	\N
183	1	2026-10-28	GTMOC	4.0000	\N
184	1	2026-10-28	GIOLUA2	1.0000	\N
185	1	2026-10-28	DABAO	1.0000	\N
186	1	2026-10-28	NEM1	2.0000	\N
187	1	2026-10-28	NEM2	3.0000	\N
188	1	2026-10-28	GIOLUA1	1.0000	\N
189	1	2026-10-29	BO	16.0000	\N
190	1	2026-10-29	PATE2	1.0000	\N
191	1	2026-10-29	GTMOC	3.0000	\N
192	1	2026-10-29	GIOLUA2	1.0000	\N
193	1	2026-10-29	DABAO	1.0000	\N
194	1	2026-10-29	NEM1	2.0000	\N
195	1	2026-10-29	NEM2	3.0000	\N
196	1	2026-10-29	GIOLUA1	1.0000	\N
\.


--
-- Data for Name: purchase; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.purchase (id, company_id, receipt_date, invoice_date, invoice_no, supplier, item_code, qty, unit_price, amount, warehouse, note, created_at, updated_at) FROM stdin;
1	1	2026-10-01	2026-10-01	1297	Hộ Kinh Doanh Phát Hải	TRGA	1500.0000	2100.0000	3150000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
2	1	2026-10-01	2026-10-01	1549	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
3	1	2026-10-01	2026-10-01	00000244	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
4	1	2026-10-01	2026-10-01	571	Lưu Tú Liên	GAHE	80.0000	15000.0000	1200000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
5	1	2026-10-02	2026-10-02	00021338	Công Ty Cổ Phần Siba Food Việt Nam	DAHE	593.7000	19000.0000	11280300.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
6	1	2026-10-02	2026-10-02	00000348	Công Ty Tnhh Sx & Tm Hướng Dương	NUMA	180.0000	18600.0000	3348000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
7	1	2026-10-02	2026-10-02	1553	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
8	1	2026-10-02	2026-10-02	1379	Công Ty Tnhh Sản Xuất Và Xuất Nhập Khẩu Bột Mì Liên Nguyễn	BOMI	2047.0000	13503.0000	27640641.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
9	1	2026-10-02	2026-10-02	00000245	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
10	1	2026-10-02	2026-10-02	9614	Công Ty Tnhh Behn Meyer Việt Nam	PG_ELPF	10.0000	500000.0000	5000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
11	1	2026-10-02	2026-10-02	9614	Công Ty Tnhh Behn Meyer Việt Nam	PG_EHCT	14.0000	500000.0000	7000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
12	1	2026-10-02	2026-10-02	9614	Công Ty Tnhh Behn Meyer Việt Nam	PG_K7	25.0000	175926.0000	4398150.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
13	1	2026-10-03	2026-10-03	00000151	Hộ Kinh Doanh Phú Tỏi	HANH	30.0000	19000.0000	570000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
14	1	2026-10-03	2026-10-03	00000151	Hộ Kinh Doanh Phú Tỏi	OT	50.0000	43000.0000	2150000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
15	1	2026-10-03	2026-10-03	00000151	Hộ Kinh Doanh Phú Tỏi	TOI	110.0000	33000.0000	3630000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
16	1	2026-10-03	2026-10-03	00001028	Công Ty Tnhh Thương Mại Thủy Hải Sản Trường Phát	DNCA	825.0000	43000.0000	35475000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
17	1	2026-10-03	2026-10-03	00001028	Công Ty Tnhh Thương Mại Thủy Hải Sản Trường Phát	DECA	225.0000	33000.0000	7425000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
18	1	2026-10-03	2026-10-03	00007511	Công Ty Tnhh Thương Mại Đầu Tư Phát Triển Navico	PG_DAI	20.0000	101851.8500	2037037.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
19	1	2026-10-03	2026-10-03	00007511	Công Ty Tnhh Thương Mại Đầu Tư Phát Triển Navico	PG_GION	20.0000	101851.8500	2037037.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
20	1	2026-10-03	2026-10-03	00049690	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	60.3000	32000.0000	1929600.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
21	1	2026-10-03	2026-10-03	00003124	Công Ty Tnhh Foco Food	PG_TP2	30.0000	120370.3700	3611111.1000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
22	1	2026-10-03	2026-10-03	38	Công Ty Tnhh Ánh Dương Xanh Food	MUIHEO	500.0000	35000.0000	17500000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
23	1	2026-10-03	2026-10-03	00001416	Công Ty Tnhh Thương Mại Dịch Vụ Một Thành Viên Sáu Vân	DUONGPHEN	30.0000	20833.3300	624999.9000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
24	1	2026-10-03	2026-10-03	00001416	Công Ty Tnhh Thương Mại Dịch Vụ Một Thành Viên Sáu Vân	DUONG	1300.0000	16759.2600	21787038.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
25	1	2026-10-03	2026-10-03	1555	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
26	1	2026-10-03	2026-10-03	00001151	Công Ty Tnhh Chế Biến Thực Phẩm - Thương Mại An Quang	THGA	600.0000	50000.0000	30000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
27	1	2026-10-03	2026-10-03	791	Công Ty Tnhh Dầu Thực Vật Thiêm Ký	DAU	1250.0000	40000.0000	50000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
28	1	2026-10-03	2026-10-03	00000246	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
29	1	2026-10-03	2026-10-03	574	Lưu Tú Liên	GAHE	80.0000	15000.0000	1200000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
30	1	2026-10-04	2026-10-04	00049851	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	30.2000	32000.0000	966400.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
31	1	2026-10-04	2026-10-04	1556	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	160.0000	14000.0000	2240000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
32	1	2026-10-04	2026-10-04	00000247	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
33	1	2026-10-05	2026-10-05	00050154	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	60.2000	32000.0000	1926400.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
34	1	2026-10-05	2026-10-05	00000248	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
35	1	2026-10-06	2026-10-06	00000153	Hộ Kinh Doanh Phú Tỏi	HANH	30.0000	19000.0000	570000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
36	1	2026-10-06	2026-10-06	00000153	Hộ Kinh Doanh Phú Tỏi	OT	40.0000	43000.0000	1720000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
37	1	2026-10-06	2026-10-06	00000153	Hộ Kinh Doanh Phú Tỏi	TOI	100.0000	33000.0000	3300000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
38	1	2026-10-06	2026-10-06	00050389	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	49.2000	32000.0000	1574400.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
39	1	2026-10-06	2026-10-06	581	Lưu Tú Liên	GAHE	80.0000	15000.0000	1200000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
40	1	2026-10-06	2026-10-06	9730	Công Ty Tnhh Behn Meyer Việt Nam	PG_ELPF	10.0000	500000.0000	5000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
41	1	2026-10-06	2026-10-06	9730	Công Ty Tnhh Behn Meyer Việt Nam	PG_EHCT	14.0000	500000.0000	7000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
42	1	2026-10-06	2026-10-06	9730	Công Ty Tnhh Behn Meyer Việt Nam	PG_K7	25.0000	175926.0000	4398150.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
43	1	2026-10-07	2026-10-07	00001424	Công Ty Tnhh Thương Mại Dịch Vụ Một Thành Viên Sáu Vân	DUONGPHEN	20.0000	21666.7000	433334.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
44	1	2026-10-07	2026-10-07	00001424	Công Ty Tnhh Thương Mại Dịch Vụ Một Thành Viên Sáu Vân	DUONG	1000.0000	16759.2600	16759260.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
45	1	2026-10-07	2026-10-07	00050659	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	39.3500	32000.0000	1259200.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
46	1	2026-10-07	2026-10-07	1563	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
47	1	2026-10-07	2026-10-07	1565	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
48	1	2026-10-07	2026-10-07	00000250	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
49	1	2026-10-07	2026-10-07	583	Lưu Tú Liên	GAHE	80.0000	15000.0000	1200000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
50	1	2026-10-08	2026-10-08	00000154	Hộ Kinh Doanh Phú Tỏi	HANH	30.0000	20000.0000	600000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
51	1	2026-10-08	2026-10-08	00000154	Hộ Kinh Doanh Phú Tỏi	OT	30.0000	46000.0000	1380000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
52	1	2026-10-08	2026-10-08	00000154	Hộ Kinh Doanh Phú Tỏi	TOI	79.0000	34000.0000	2686000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
53	1	2026-10-08	2026-10-08	00001178	Công Ty Tnhh Chế Biến Thực Phẩm - Thương Mại An Quang	THGA	440.0000	55000.0000	24200000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
54	1	2026-10-08	2026-10-08	9831	Công Ty Tnhh Behn Meyer Việt Nam	PG_ELPF	10.0000	500000.0000	5000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
55	1	2026-10-08	2026-10-08	9831	Công Ty Tnhh Behn Meyer Việt Nam	PG_EHCT	14.0000	500000.0000	7000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
56	1	2026-10-08	2026-10-08	9831	Công Ty Tnhh Behn Meyer Việt Nam	PG_K7	25.0000	175926.0000	4398150.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
57	1	2026-10-08	2026-10-08	00001044	Công Ty Tnhh Thương Mại Thủy Hải Sản Trường Phát	DNCA	605.0000	43000.0000	26015000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
58	1	2026-10-08	2026-10-08	00001044	Công Ty Tnhh Thương Mại Thủy Hải Sản Trường Phát	DECA	165.0000	33000.0000	5445000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
59	1	2026-10-08	2026-10-08	1568	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
60	1	2026-10-08	2026-10-08	00000251	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
61	1	2026-10-08	2026-10-08	585	Lưu Tú Liên	GAHE	100.0000	15000.0000	1500000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
62	1	2026-10-08	2026-10-09	00010705	Công Ty Cổ Phần Phát Triển Khoa Học Công Nghệ Mỹ Úc	PG_MEPL	50.0000	136818.0000	6840900.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
63	1	2026-10-08	2026-10-09	00051104	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	60.7500	32000.0000	1944000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
64	1	2026-10-08	2026-10-09	1570	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
65	1	2026-10-08	2026-10-09	823	Công Ty Tnhh Dầu Thực Vật Thiêm Ký	DAU	1250.0000	40000.0000	50000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
66	1	2026-10-09	2026-10-09	00000252	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
67	1	2026-10-09	2026-10-09	588	Lưu Tú Liên	GAHE	80.0000	15000.0000	1200000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
68	1	2026-10-09	2026-10-09	9893	Công Ty Tnhh Behn Meyer Việt Nam	PG_ELPF	20.0000	500000.0000	10000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
69	1	2026-10-09	2026-10-09	9893	Công Ty Tnhh Behn Meyer Việt Nam	PG_EHCT	28.0000	500000.0000	14000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
70	1	2026-10-09	2026-10-10	1574	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
71	1	2026-10-09	2026-10-10	00000253	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
72	1	2026-10-09	2026-10-10	589	Lưu Tú Liên	GAHE	80.0000	15000.0000	1200000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
73	1	2026-10-09	2026-10-11	00000254	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
74	1	2026-10-10	2026-10-12	00000255	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
75	1	2026-10-10	2026-10-12	829	Công Ty Tnhh Dầu Thực Vật Thiêm Ký	DAU	1250.0000	40000.0000	50000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
76	1	2026-10-10	2026-10-12	1579	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	120.0000	14000.0000	1680000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
77	1	2026-10-11	2026-10-12	00051827	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	87.1500	32000.0000	2788800.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
78	1	2026-10-12	2026-10-13	00052002	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	40.2000	32000.0000	1286400.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
79	1	2026-10-12	2026-10-13	00000256	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
80	1	2026-10-12	2026-10-13	594	Lưu Tú Liên	GAHE	100.0000	15000.0000	1500000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
81	1	2026-10-12	2026-10-14	00052359	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	43.4000	32000.0000	1388800.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
82	1	2026-10-13	2026-10-14	00003317	Công Ty Tnhh Foco Food	PG_ACSO	10.0000	120370.3700	1203703.7000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
83	1	2026-10-13	2026-10-14	00001466	Công Ty Tnhh Thương Mại Dịch Vụ Một Thành Viên Sáu Vân	MUOI	650.0000	3200.0000	2080000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
84	1	2026-10-13	2026-10-14	1584	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
85	1	2026-10-14	2026-10-14	1586	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
86	1	2026-10-14	2026-10-14	00000258	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
87	1	2026-10-14	2026-10-14	596	Lưu Tú Liên	GAHE	100.0000	15000.0000	1500000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
88	1	2026-10-14	2026-10-14	282	Công Ty Tnhh Tm Dv XuấT NhậP KhẩU ThựC PhẩM Thăng Long	TIHE	400.0000	42000.0000	16800000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
89	1	2026-10-14	2026-10-14	282	Công Ty Tnhh Tm Dv XuấT NhậP KhẩU ThựC PhẩM Thăng Long	DAHE	1600.0000	36000.0000	57600000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
90	1	2026-10-14	2026-10-14	282	Công Ty Tnhh Tm Dv XuấT NhậP KhẩU ThựC PhẩM Thăng Long	DAHE	400.0000	36000.0000	14400000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
91	1	2026-10-14	2026-10-15	00000955	Công Ty Tnhh Xuất Nhập Khẩu Bao Bì Hồng Hà	MBB	200.0000	112037.0400	22407408.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
92	1	2026-10-14	2026-10-15	00000955	Công Ty Tnhh Xuất Nhập Khẩu Bao Bì Hồng Hà	BB_TG	53400.0000	194.4000	10380960.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
93	1	2026-10-14	2026-10-15	00022575	Công Ty Cổ Phần Siba Food Việt Nam	DAHE	512.0000	19000.0000	9728000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
94	1	2026-10-14	2026-10-15	1589	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
95	1	2026-10-15	2026-10-15	2171	Công Ty Tnhh Kinh Doanh Thực Phẩm Lâm Hưng Phúc	MOHE	200.0000	22000.0000	4400000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
96	1	2026-10-15	2026-10-15	00000259	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
97	1	2026-10-15	2026-10-15	599	Lưu Tú Liên	MUIHEO	200.0000	32000.0000	6400000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
98	1	2026-10-15	2026-10-15	568	Công Ty Tnhh Ẩm Thực Hoàng Gia Việt	TGA_X	500.0000	28000.0000	14000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
99	1	2026-10-15	2026-10-16	00000158	Hộ Kinh Doanh Phú Tỏi	HANH	30.0000	21000.0000	630000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
100	1	2026-10-15	2026-10-16	00000158	Hộ Kinh Doanh Phú Tỏi	OT	50.0000	45000.0000	2250000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
101	1	2026-10-15	2026-10-16	00000158	Hộ Kinh Doanh Phú Tỏi	TOI	108.0000	34000.0000	3672000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
102	1	2026-10-15	2026-10-16	00001076	Công Ty Tnhh Thương Mại Thủy Hải Sản Trường Phát	DNCA	825.0000	43000.0000	35475000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
103	1	2026-10-16	2026-10-16	00001076	Công Ty Tnhh Thương Mại Thủy Hải Sản Trường Phát	DECA	225.0000	33000.0000	7425000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
104	1	2026-10-16	2026-10-16	00052755	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	60.4500	32000.0000	1934400.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
105	1	2026-10-16	2026-10-16	00001219	Công Ty Tnhh Chế Biến Thực Phẩm - Thương Mại An Quang	THGA	600.0000	56000.0000	33600000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
106	1	2026-10-16	2026-10-16	00000260	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
107	1	2026-10-16	2026-10-17	00000159	Hộ Kinh Doanh Phú Tỏi	OT	40.0000	43000.0000	1720000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
108	1	2026-10-16	2026-10-17	00000159	Hộ Kinh Doanh Phú Tỏi	TOI	80.0000	34000.0000	2720000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
109	1	2026-10-16	2026-10-17	00001079	Công Ty Tnhh Thương Mại Thủy Hải Sản Trường Phát	DNCA	825.0000	46000.0000	37950000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
110	1	2026-10-16	2026-10-17	00001079	Công Ty Tnhh Thương Mại Thủy Hải Sản Trường Phát	DECA	225.0000	36000.0000	8100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
111	1	2026-10-17	2026-10-17	00053135	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	26.0000	32000.0000	832000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
112	1	2026-10-17	2026-10-17	00001486	Công Ty Tnhh Thương Mại Dịch Vụ Một Thành Viên Sáu Vân	DUONGPHEN	60.0000	19722.2200	1183333.2000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
113	1	2026-10-17	2026-10-17	00001486	Công Ty Tnhh Thương Mại Dịch Vụ Một Thành Viên Sáu Vân	DUONG	1150.0000	18055.5600	20763894.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
114	1	2026-10-17	2026-10-17	1	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
115	1	2026-10-17	2026-10-17	2	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	160.0000	14000.0000	2240000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
116	1	2026-10-17	2026-10-17	00001221	Công Ty Tnhh Chế Biến Thực Phẩm - Thương Mại An Quang	THGA	600.0000	56000.0000	33600000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
117	1	2026-10-17	2026-10-17	00000261	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
118	1	2026-10-17	2026-10-17	602	Lưu Tú Liên	GAHE	80.0000	15000.0000	1200000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
119	1	2026-10-17	2026-10-18	00053294	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	30.0000	32000.0000	960000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
120	1	2026-10-17	2026-10-19	00011019	Công Ty Cổ Phần Phát Triển Khoa Học Công Nghệ Mỹ Úc	PG_MEPL	50.0000	136818.0000	6840900.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
121	1	2026-10-17	2026-10-19	00053501	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	30.2000	32000.0000	966400.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
122	1	2026-10-17	2026-10-19	1596	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
123	1	2026-10-18	2026-10-19	2212	Công Ty Tnhh Kinh Doanh Thực Phẩm Lâm Hưng Phúc	MOHE	200.0000	20000.0000	4000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
124	1	2026-10-19	2026-10-19	10215	Công Ty Tnhh Behn Meyer Việt Nam	PG_ELPF	10.0000	500000.0000	5000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
125	1	2026-10-19	2026-10-19	10215	Công Ty Tnhh Behn Meyer Việt Nam	PG_EHCT	14.0000	500000.0000	7000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
126	1	2026-10-19	2026-10-19	10215	Công Ty Tnhh Behn Meyer Việt Nam	PG_K7	25.0000	175926.0000	4398150.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
127	1	2026-10-19	2026-10-20	00053729	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	29.6000	32000.0000	947200.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
128	1	2026-10-19	2026-10-20	1599	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
129	1	2026-10-19	2026-10-20	878	Công Ty Tnhh Dầu Thực Vật Thiêm Ký	DAU	1250.0000	40000.0000	50000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
130	1	2026-10-19	2026-10-20	00000262	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
131	1	2026-10-20	2026-10-21	00054102	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	35.7900	32000.0000	1145280.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
132	1	2026-10-20	2026-10-21	1602	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
133	1	2026-10-20	2026-10-21	00000264	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
134	1	2026-10-20	2026-10-22	00001101	Công Ty Tnhh Thương Mại Thủy Hải Sản Trường Phát	DNCA	660.0000	46000.0000	30360000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
135	1	2026-10-21	2026-10-22	00001101	Công Ty Tnhh Thương Mại Thủy Hải Sản Trường Phát	DECA	180.0000	36000.0000	6480000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
136	1	2026-10-21	2026-10-22	00023415	Công Ty Cổ Phần Siba Food Việt Nam	DAHE	376.1000	19000.0000	7145900.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
137	1	2026-10-21	2026-10-22	1213	Doanh Nghiệp Tư Nhân Tm Dv Vũ Ngọc	MOHE	387.3000	24000.0000	9295200.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
138	1	2026-10-22	2026-10-22	00001243	Công Ty Tnhh Chế Biến Thực Phẩm - Thương Mại An Quang	THGA	480.0000	58000.0000	27840000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
139	1	2026-10-22	2026-10-22	10362	Công Ty Tnhh Behn Meyer Việt Nam	PG_ELPF	10.0000	500000.0000	5000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
140	1	2026-10-22	2026-10-22	10362	Công Ty Tnhh Behn Meyer Việt Nam	PG_EHCT	14.0000	500000.0000	7000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
141	1	2026-10-22	2026-10-22	10362	Công Ty Tnhh Behn Meyer Việt Nam	PG_K7	25.0000	175926.0000	4398150.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
142	1	2026-10-22	2026-10-22	00000161	Hộ Kinh Doanh Phú Tỏi	HANH	30.0000	21000.0000	630000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
143	1	2026-10-22	2026-10-22	00000161	Hộ Kinh Doanh Phú Tỏi	OT	40.0000	45000.0000	1800000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
144	1	2026-10-22	2026-10-22	00000161	Hộ Kinh Doanh Phú Tỏi	TOI	80.0000	34000.0000	2720000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
145	1	2026-10-22	2026-10-22	1605	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
146	1	2026-10-23	2026-10-22	00000265	Nguyễn Thị Huỳnh Trang	DAHE	160.0000	30000.0000	4800000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
147	1	2026-10-23	2026-10-23	00001523	Công Ty Tnhh Thương Mại Dịch Vụ Một Thành Viên Sáu Vân	DUONGPHEN	30.0000	20740.7400	622222.2000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
148	1	2026-10-23	2026-10-23	00001523	Công Ty Tnhh Thương Mại Dịch Vụ Một Thành Viên Sáu Vân	DUONG	900.0000	17916.6700	16125003.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
149	1	2026-10-23	2026-10-23	1608	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
150	1	2026-10-23	2026-10-23	898	Công Ty Tnhh Dầu Thực Vật Thiêm Ký	DAU	1250.0000	40000.0000	50000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
151	1	2026-10-23	2026-10-23	899	Công Ty Tnhh Dầu Thực Vật Thiêm Ký	DAU	1250.0000	40000.0000	50000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
152	1	2026-10-23	2026-10-23	2248	Công Ty Tnhh Kinh Doanh Thực Phẩm Lâm Hưng Phúc	MOHE	200.0000	20000.0000	4000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
153	1	2026-10-23	2026-10-23	00000266	Nguyễn Thị Huỳnh Trang	DAHE	180.0000	30000.0000	5400000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
154	1	2026-10-24	2026-10-23	614	Lưu Tú Liên	GAHE	100.0000	15000.0000	1500000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
155	1	2026-10-24	2026-10-24	00011254	Công Ty Cổ Phần Phát Triển Khoa Học Công Nghệ Mỹ Úc	TBB	1200.0000	18703.0000	22443600.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
156	1	2026-10-24	2026-10-24	00054794	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	60.4000	32000.0000	1932800.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
157	1	2026-10-26	2026-10-24	00000268	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
158	1	2026-10-26	2026-10-24	1611	Công Ty Tnhh Thương Mại Dịch Vụ Vinh Yến	GAHE	180.0000	14000.0000	2520000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
159	1	2026-10-26	2026-10-24	615	Lưu Tú Liên	GAHE	80.0000	15000.0000	1200000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
160	1	2026-10-26	2026-10-25	00055016	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	40.2000	32000.0000	1286400.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
161	1	2026-10-26	2026-10-25	00000269	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
162	1	2026-10-26	2026-10-26	00000165	Hộ Kinh Doanh Phú Tỏi	HANH	30.0000	21000.0000	630000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
163	1	2026-10-26	2026-10-26	00000165	Hộ Kinh Doanh Phú Tỏi	OT	40.0000	45000.0000	1800000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
164	1	2026-10-26	2026-10-26	00000165	Hộ Kinh Doanh Phú Tỏi	TOI	80.0000	34000.0000	2720000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
165	1	2026-10-26	2026-10-26	00011310	Công Ty Cổ Phần Phát Triển Khoa Học Công Nghệ Mỹ Úc	PG_TP2	10.0000	125000.0000	1250000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
166	1	2026-10-26	2026-10-26	00011310	Công Ty Cổ Phần Phát Triển Khoa Học Công Nghệ Mỹ Úc	PG_ENZY	20.0000	111111.0000	2222220.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
167	1	2026-10-26	2026-10-26	00011310	Công Ty Cổ Phần Phát Triển Khoa Học Công Nghệ Mỹ Úc	PG_DAI	10.0000	171296.0000	1712960.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
168	1	2026-10-26	2026-10-26	00011310	Công Ty Cổ Phần Phát Triển Khoa Học Công Nghệ Mỹ Úc	PG_N61	10.0000	111111.0000	1111110.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
169	1	2026-10-26	2026-10-26	00055225	Công Ty Cổ Phần Thực Phẩm Vĩnh Tân	DAHE	27.0000	32000.0000	864000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
170	1	2026-10-27	2026-10-26	00000274	Hộ Kinh Doanh Trần Thị Hiên 1992	GAHE	180.0000	12000.0000	2160000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
171	1	2026-10-27	2026-10-26	00000270	Nguyễn Thị Huỳnh Trang	DAHE	170.0000	30000.0000	5100000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
172	1	2026-10-27	2026-10-26	10463	Công Ty Tnhh Behn Meyer Việt Nam	PG_ELPF	10.0000	500000.0000	5000000.0000	152	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
\.


--
-- Data for Name: risk_threshold; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.risk_threshold (company_id, risk_key, warn_value, high_value) FROM stdin;
1	giamua	1.0000	5.0000
1	giaban	1.0000	5.0000
1	sxban	1.1500	1.3000
1	tonTP	45.0000	60.0000
1	cp627	3500.0000	5000.0000
1	gvdt	0.9000	1.0000
1	banlo	1.0000	5.0000
1	tpam	1.0000	1.0000
1	cpchua	1.0000	1.0000
1	maam	1.0000	1.0000
1	nvlam	1.0000	10.0000
\.


--
-- Data for Name: sale; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.sale (id, company_id, invoice_date, item_code, qty, revenue, note, created_at, updated_at) FROM stdin;
1	1	2026-10-01	BO	491.3000	27190473.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
2	1	2026-10-01	DABAO	298.1000	22382198.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
3	1	2026-10-01	DABAONAC	101.0000	9910170.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
4	1	2026-10-01	GTMOC	393.1000	22437959.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
5	1	2026-10-01	GTXAO	28.1000	2601863.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
6	1	2026-10-01	GIOLUA1	169.2000	17070380.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
7	1	2026-10-01	GIOLUA2	90.0000	5416650.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
8	1	2026-10-01	NEM1	235.0000	15720610.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
9	1	2026-10-01	NEM2	520.6000	31102856.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
10	1	2026-10-01	PATE1	131.7000	7499571.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
11	1	2026-10-01	PATE2	266.9000	10625200.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
12	1	2026-10-02	BO	353.1000	19561481.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
13	1	2026-10-02	DABAO	277.0000	20861118.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
14	1	2026-10-02	GTMOC	261.0000	14741544.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
15	1	2026-10-02	GTXAO	20.0000	1833320.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
16	1	2026-10-02	GIOLUA2	49.4000	3174617.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
17	1	2026-10-02	NEM1	135.0000	8884163.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
18	1	2026-10-02	NEM2	633.1000	38296723.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
19	1	2026-10-02	PATE1	358.1000	20120364.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
20	1	2026-10-02	PATE2	403.0000	16405807.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
21	1	2026-10-03	BO	209.3000	11701686.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
22	1	2026-10-03	DABAO	123.0000	9299080.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
23	1	2026-10-03	DABAONAC	46.9000	4575365.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
24	1	2026-10-03	GTMOC	88.0000	4970356.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
25	1	2026-10-03	GTXAO	29.0000	2703706.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
26	1	2026-10-03	GIOLUA1	60.8000	6196286.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
27	1	2026-10-03	GIOLUA2	81.0000	5435114.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
28	1	2026-10-03	NEM1	66.0000	4395326.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
29	1	2026-10-03	NEM2	547.0000	32935352.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
30	1	2026-10-03	PATE1	89.0000	4971272.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
31	1	2026-10-03	PATE2	214.1000	8796805.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
32	1	2026-10-04	BO	13.5000	750001.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
33	1	2026-10-04	DABAO	40.0000	3000000.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
34	1	2026-10-04	GTMOC	153.0000	8641608.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
35	1	2026-10-04	GIOLUA2	10.0000	648140.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
36	1	2026-10-04	NEM2	94.0000	5657407.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
37	1	2026-10-04	PATE1	15.0000	847222.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
38	1	2026-10-04	PATE2	104.0000	4177764.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
39	1	2026-10-06	BO	649.8000	36326715.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
40	1	2026-10-06	DABAO	364.7000	27377198.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
41	1	2026-10-06	DABAONAC	2.0000	190741.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
42	1	2026-10-06	GTMOC	364.0000	20790535.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
43	1	2026-10-06	GTXAO	77.1000	7101868.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
44	1	2026-10-06	GIOLUA1	67.0000	6870380.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
45	1	2026-10-06	GIOLUA2	10.0000	648140.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
46	1	2026-10-06	NEM1	503.0000	33977005.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
47	1	2026-10-06	NEM2	617.0000	37158488.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
48	1	2026-10-06	PATE1	270.1000	15029263.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
49	1	2026-10-06	PATE2	483.1000	19352666.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
50	1	2026-10-07	BO	334.5000	18652682.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
51	1	2026-10-07	DABAO	183.0000	13725000.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
52	1	2026-10-07	DABAONAC	10.0000	953704.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
53	1	2026-10-07	GTMOC	204.2000	11616219.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
54	1	2026-10-07	GTXAO	9.0000	833337.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
55	1	2026-10-07	GIOLUA1	24.0000	2355542.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
56	1	2026-10-07	GIOLUA2	90.0000	5231490.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
57	1	2026-10-07	NEM1	91.0000	6095345.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
58	1	2026-10-07	NEM2	629.0000	37910668.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
59	1	2026-10-07	PATE1	125.8000	7170029.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
60	1	2026-10-07	PATE2	525.4000	20985216.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
61	1	2026-10-08	BO	63.8000	3544416.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
62	1	2026-10-08	DABAO	66.7000	5027198.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
63	1	2026-10-08	GTMOC	47.0000	2704638.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
64	1	2026-10-08	GTXAO	28.1000	2601863.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
65	1	2026-10-08	NEM1	20.0000	1320000.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
66	1	2026-10-08	NEM2	350.2000	21113902.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
67	1	2026-10-08	PATE1	46.5000	2730463.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
68	1	2026-10-08	PATE2	39.1000	1460477.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
69	1	2026-10-09	BO	200.3000	11334784.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
70	1	2026-10-09	DABAO	330.6000	24869080.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
71	1	2026-10-09	DABAONAC	16.0000	1525926.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
72	1	2026-10-09	GTMOC	394.7000	22339374.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
73	1	2026-10-09	GTXAO	23.0000	2092578.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
74	1	2026-10-09	GIOLUA2	80.0000	5444400.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
75	1	2026-10-09	NEM1	103.0000	6833473.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
76	1	2026-10-09	NEM2	283.0000	16969471.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
77	1	2026-10-09	PATE1	195.0000	11041992.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
78	1	2026-10-09	PATE2	292.3000	11780826.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
79	1	2026-10-10	BO	322.5000	17944342.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
80	1	2026-10-10	DABAO	181.0000	13575000.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
81	1	2026-10-10	DABAONAC	16.0000	1539814.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
82	1	2026-10-10	GTMOC	110.0000	6351817.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
83	1	2026-10-10	GIOLUA1	15.0000	1355543.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
84	1	2026-10-10	GIOLUA2	30.0000	1805550.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
85	1	2026-10-10	NEM1	88.0000	5880521.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
86	1	2026-10-10	NEM2	726.0000	43634505.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
87	1	2026-10-10	PATE1	263.5000	14822618.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
88	1	2026-10-10	PATE2	281.7000	11209246.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
89	1	2026-10-12	BO	739.2000	40878600.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
90	1	2026-10-12	DABAO	290.0000	21750000.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
91	1	2026-10-12	DABAONAC	15.0000	1416675.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
92	1	2026-10-12	GTMOC	53.5000	3105072.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
93	1	2026-10-12	GTXAO	131.0000	12009173.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
94	1	2026-10-12	GIOLUA1	32.0000	3259264.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
95	1	2026-10-12	GIOLUA2	2.0000	142593.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
96	1	2026-10-12	NEM1	814.7000	52427149.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
97	1	2026-10-12	NEM2	555.6000	33276973.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
98	1	2026-10-12	PATE1	268.1000	15269315.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
99	1	2026-10-12	PATE2	342.3000	13736973.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
100	1	2026-10-13	BO	174.3000	9789801.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
101	1	2026-10-13	DABAO	253.7000	19052198.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
102	1	2026-10-13	GTMOC	321.1000	18429658.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
103	1	2026-10-13	GTXAO	41.1000	3805567.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
104	1	2026-10-13	GIOLUA1	25.0000	2444430.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
105	1	2026-10-13	GIOLUA2	40.0000	2453690.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
106	1	2026-10-13	NEM1	404.9000	26950023.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
107	1	2026-10-13	NEM2	455.0000	27309990.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
108	1	2026-10-13	PATE1	122.0000	6757346.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
109	1	2026-10-13	PATE2	228.3000	8985476.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
110	1	2026-10-14	BO	374.9000	20804809.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
111	1	2026-10-14	DABAO	358.0000	27035170.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
112	1	2026-10-14	DABAONAC	11.1000	1058607.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
113	1	2026-10-14	GTMOC	255.0000	14708236.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
114	1	2026-10-14	GTXAO	10.0000	916660.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
115	1	2026-10-14	GIOLUA1	50.0000	5092600.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
116	1	2026-10-14	GIOLUA2	48.0000	3111099.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
117	1	2026-10-14	NEM1	117.3000	7786783.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
118	1	2026-10-14	NEM2	674.0000	40462974.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
119	1	2026-10-14	PATE1	285.5000	16095152.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
120	1	2026-10-14	PATE2	393.1000	15951585.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
121	1	2026-10-15	BO	179.8000	10073130.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
122	1	2026-10-15	DABAO	181.5000	13612500.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
123	1	2026-10-15	DABAONAC	37.9000	3689251.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
124	1	2026-10-15	GTMOC	293.0000	16798961.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
125	1	2026-10-15	GIOLUA1	41.8000	4062954.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
126	1	2026-10-15	GIOLUA2	50.0000	3101830.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
127	1	2026-10-15	NEM1	112.7000	7476797.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
128	1	2026-10-15	NEM2	325.0000	19495397.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
129	1	2026-10-15	PATE1	142.0000	8139337.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
130	1	2026-10-15	PATE2	262.4000	10530711.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
131	1	2026-10-16	BO	407.2000	22714095.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
132	1	2026-10-16	DABAO	255.7000	19277204.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
133	1	2026-10-16	DABAONAC	11.0000	1049074.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
134	1	2026-10-16	GTMOC	325.0000	18698927.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
135	1	2026-10-16	GTXAO	58.1000	5324073.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
136	1	2026-10-16	GIOLUA2	90.0000	6064790.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
137	1	2026-10-16	NEM1	258.0000	17499943.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
138	1	2026-10-16	NEM2	387.7000	23376529.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
139	1	2026-10-16	PATE1	94.1000	5168907.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
140	1	2026-10-16	PATE2	442.0000	17394974.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
141	1	2026-10-17	NEM1	30.0000	1980000.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
142	1	2026-10-17	NEM2	40.0000	2453330.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
143	1	2026-10-17	PATE1	15.0000	795000.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
144	1	2026-10-17	PATE2	30.0000	1050000.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
145	1	2026-10-19	BO	379.7000	21147914.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
146	1	2026-10-19	DABAO	430.4000	32377668.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
147	1	2026-10-19	GIOLUA2	50.0000	3499980.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
148	1	2026-10-19	GTMOC	205.0000	11717505.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
149	1	2026-10-19	GTXAO	27.1000	2509270.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
150	1	2026-10-19	NEM1	114.8000	7723671.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
151	1	2026-10-19	NEM2	359.8000	21719900.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
152	1	2026-10-19	PATE1	277.0000	15554602.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
153	1	2026-10-19	PATE2	326.1000	13281163.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
154	1	2026-10-20	BO	137.1000	7629883.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
155	1	2026-10-20	DABAO	145.0000	10875000.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
156	1	2026-10-20	DABAONAC	10.0000	981480.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
157	1	2026-10-20	GIOLUA1	15.0000	1333320.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
158	1	2026-10-20	GIOLUA2	60.0000	3749970.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
159	1	2026-10-20	GTMOC	215.0000	12189710.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
160	1	2026-10-20	GTXAO	10.0000	944440.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
161	1	2026-10-20	NEM1	189.3000	12750137.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
162	1	2026-10-20	NEM2	239.7000	14546037.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
163	1	2026-10-20	PATE1	132.7000	7460269.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
164	1	2026-10-20	PATE2	75.2000	2886658.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
165	1	2026-10-21	BO	268.7000	14907422.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
166	1	2026-10-21	DABAO	435.0000	32625000.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
167	1	2026-10-21	DABAONAC	31.9000	3126291.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
168	1	2026-10-21	GIOLUA1	26.8000	2729634.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
169	1	2026-10-21	GTMOC	320.0000	19092420.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
170	1	2026-10-21	GTXAO	32.0000	2907404.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
171	1	2026-10-21	NEM1	750.0000	50055395.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
172	1	2026-10-21	NEM2	397.5000	23914485.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
173	1	2026-10-21	PATE1	200.0000	11347230.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
174	1	2026-10-21	PATE2	203.5000	8006376.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
175	1	2026-10-22	BO	298.0000	16477049.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
176	1	2026-10-22	DABAO	266.2000	19994785.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
177	1	2026-10-22	GIOLUA1	52.0000	5481484.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
178	1	2026-10-22	GIOLUA2	80.0000	5027760.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
179	1	2026-10-22	GTMOC	340.0000	19481320.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
180	1	2026-10-22	GTXAO	69.6000	6425953.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
181	1	2026-10-22	NEM1	140.3000	9372350.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
182	1	2026-10-22	NEM2	307.6000	18519559.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
183	1	2026-10-22	PATE1	189.1000	10749119.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
184	1	2026-10-22	PATE2	276.4000	10689224.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
185	1	2026-10-23	BO	201.2000	11230618.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
186	1	2026-10-23	DABAO	224.0000	16800000.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
187	1	2026-10-23	DABAONAC	17.0000	1621297.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
188	1	2026-10-23	GIOLUA1	5.0000	555556.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
189	1	2026-10-23	GIOLUA2	10.0000	648150.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
190	1	2026-10-23	GTMOC	293.0000	16868391.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
191	1	2026-10-23	GTXAO	10.0000	916660.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
192	1	2026-10-23	NEM1	128.0000	8422156.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
193	1	2026-10-23	NEM2	465.6000	28096500.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
194	1	2026-10-23	PATE1	174.1000	9848874.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
195	1	2026-10-23	PATE2	495.9000	20068148.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
196	1	2026-10-24	BO	260.5000	14620302.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
197	1	2026-10-24	DABAO	112.0000	8474080.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
198	1	2026-10-24	DABAONAC	5.0000	486110.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
199	1	2026-10-24	GIOLUA2	10.0000	648150.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
200	1	2026-10-24	GTMOC	295.0000	16726717.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
201	1	2026-10-24	NEM1	109.3000	7246667.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
202	1	2026-10-24	NEM2	611.0000	36763523.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
203	1	2026-10-24	PATE1	118.0000	6485149.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
204	1	2026-10-24	PATE2	260.7000	10168604.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
205	1	2026-10-26	BO	223.1000	12499049.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
206	1	2026-10-26	DABAO	187.2000	14064698.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
207	1	2026-10-26	DABAONAC	35.0000	3379635.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
208	1	2026-10-26	GIOLUA2	40.0000	2851840.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
209	1	2026-10-26	GTMOC	106.1000	6573580.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
210	1	2026-10-26	GTXAO	48.1000	4416663.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
211	1	2026-10-26	NEM1	311.0000	20627241.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
212	1	2026-10-26	NEM2	352.0000	21231281.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
213	1	2026-10-26	PATE1	60.0000	3336645.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
214	1	2026-10-26	PATE2	208.7000	8778710.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
215	1	2026-10-27	BO	299.4000	16805641.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
216	1	2026-10-27	DABAO	387.0000	29144454.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
217	1	2026-10-27	DABAONAC	46.0000	4451844.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
218	1	2026-10-27	GIOLUA1	32.0000	3259264.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
219	1	2026-10-27	GIOLUA2	51.0000	3302786.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
220	1	2026-10-27	GTMOC	643.0000	36317323.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
221	1	2026-10-27	GTXAO	6.0000	555555.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
222	1	2026-10-27	NEM1	302.0000	20479133.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
223	1	2026-10-27	NEM2	622.4000	37315192.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
224	1	2026-10-27	PATE1	370.3000	20775447.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
225	1	2026-10-27	PATE2	284.4000	11275407.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
226	1	2026-10-28	BO	190.5000	10514769.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
227	1	2026-10-28	DABAO	240.0000	18635150.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
228	1	2026-10-28	DABAONAC	10.0000	1018510.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
229	1	2026-10-28	GIOLUA2	10.0000	648150.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
230	1	2026-10-28	GTMOC	195.0000	11198995.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
231	1	2026-10-28	GTXAO	30.0000	2722230.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
232	1	2026-10-28	NEM1	49.3000	3282004.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
233	1	2026-10-28	NEM2	430.0000	25963180.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
234	1	2026-10-28	PATE1	72.0000	4214844.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
235	1	2026-10-28	PATE2	337.9000	13674360.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
236	1	2026-10-29	BO	5.0000	291665.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
237	1	2026-10-29	DABAO	90.0000	6750000.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
238	1	2026-10-29	GIOLUA2	5.0000	324075.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
239	1	2026-10-29	GTMOC	210.0000	11861010.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
240	1	2026-10-29	NEM1	30.0000	2092584.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
241	1	2026-10-29	NEM2	40.0000	2333320.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
242	1	2026-10-29	PATE1	5.0000	305555.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
243	1	2026-10-29	PATE2	100.0000	4166600.0000	\N	2026-11-04 18:11:03.316192+07	2026-11-04 18:11:03.316192+07
\.


--
-- Data for Name: work_calendar; Type: TABLE DATA; Schema: giathanh; Owner: -
--

COPY giathanh.work_calendar (company_id, day, kind, note) FROM stdin;
1	2026-01-01	HOLIDAY	Tết Dương lịch
1	2026-02-14	HOLIDAY	Thứ bảy trong kỳ nghỉ Tết Nguyên đán 9 ngày (14–22/02)
1	2026-02-16	HOLIDAY	Tết Nguyên đán – 29 tháng Chạp (ngày nghỉ 1)
1	2026-02-17	HOLIDAY	Tết Nguyên đán – mùng 1 (ngày nghỉ 2)
1	2026-02-18	HOLIDAY	Tết Nguyên đán – mùng 2 (ngày nghỉ 3)
1	2026-02-19	HOLIDAY	Tết Nguyên đán – mùng 3 (ngày nghỉ 4)
1	2026-02-20	HOLIDAY	Tết Nguyên đán – mùng 4 (ngày nghỉ 5)
1	2026-02-21	HOLIDAY	Thứ bảy trong kỳ nghỉ Tết Nguyên đán 9 ngày (14–22/02)
1	2026-04-26	HOLIDAY	Giỗ Tổ Hùng Vương (10/3 âm lịch, rơi Chủ nhật)
1	2026-04-27	HOLIDAY	Nghỉ bù Giỗ Tổ Hùng Vương
1	2026-04-30	HOLIDAY	Ngày Chiến thắng 30/4
1	2026-05-01	HOLIDAY	Quốc tế Lao động 1/5
1	2026-08-31	HOLIDAY	Nghỉ hoán đổi dịp Quốc khánh (làm bù thứ Bảy 22/8) – theo Bộ Nội vụ, doanh nghiệp tùy chọn
1	2026-09-01	HOLIDAY	Quốc khánh – ngày nghỉ liền kề trước 2/9
1	2026-09-02	HOLIDAY	Quốc khánh 2/9
\.


--
-- Name: bom_line_id_seq; Type: SEQUENCE SET; Schema: giathanh; Owner: -
--

SELECT pg_catalog.setval('giathanh.bom_line_id_seq', 269, true);


--
-- Name: common_issue_id_seq; Type: SEQUENCE SET; Schema: giathanh; Owner: -
--

SELECT pg_catalog.setval('giathanh.common_issue_id_seq', 1, false);


--
-- Name: company_id_seq; Type: SEQUENCE SET; Schema: giathanh; Owner: -
--

SELECT pg_catalog.setval('giathanh.company_id_seq', 1, true);


--
-- Name: cost_material_line_id_seq; Type: SEQUENCE SET; Schema: giathanh; Owner: -
--

SELECT pg_catalog.setval('giathanh.cost_material_line_id_seq', 1, false);


--
-- Name: cost_run_id_seq; Type: SEQUENCE SET; Schema: giathanh; Owner: -
--

SELECT pg_catalog.setval('giathanh.cost_run_id_seq', 1, false);


--
-- Name: material_substitution_id_seq; Type: SEQUENCE SET; Schema: giathanh; Owner: -
--

SELECT pg_catalog.setval('giathanh.material_substitution_id_seq', 1, false);


--
-- Name: order_material_adjustment_id_seq; Type: SEQUENCE SET; Schema: giathanh; Owner: -
--

SELECT pg_catalog.setval('giathanh.order_material_adjustment_id_seq', 249, true);


--
-- Name: production_capacity_id_seq; Type: SEQUENCE SET; Schema: giathanh; Owner: -
--

SELECT pg_catalog.setval('giathanh.production_capacity_id_seq', 1, false);


--
-- Name: production_order_id_seq; Type: SEQUENCE SET; Schema: giathanh; Owner: -
--

SELECT pg_catalog.setval('giathanh.production_order_id_seq', 132, true);


--
-- Name: production_plan_id_seq; Type: SEQUENCE SET; Schema: giathanh; Owner: -
--

SELECT pg_catalog.setval('giathanh.production_plan_id_seq', 196, true);


--
-- Name: purchase_id_seq; Type: SEQUENCE SET; Schema: giathanh; Owner: -
--

SELECT pg_catalog.setval('giathanh.purchase_id_seq', 172, true);


--
-- Name: sale_id_seq; Type: SEQUENCE SET; Schema: giathanh; Owner: -
--

SELECT pg_catalog.setval('giathanh.sale_id_seq', 243, true);


--
-- Name: bom_line bom_line_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.bom_line
    ADD CONSTRAINT bom_line_pkey PRIMARY KEY (id);


--
-- Name: common_issue common_issue_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.common_issue
    ADD CONSTRAINT common_issue_pkey PRIMARY KEY (id);


--
-- Name: company company_code_key; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.company
    ADD CONSTRAINT company_code_key UNIQUE (code);


--
-- Name: company company_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (id);


--
-- Name: company_setting company_setting_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.company_setting
    ADD CONSTRAINT company_setting_pkey PRIMARY KEY (company_id);


--
-- Name: cost_column cost_column_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.cost_column
    ADD CONSTRAINT cost_column_pkey PRIMARY KEY (company_id, code);


--
-- Name: cost_material_line cost_material_line_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.cost_material_line
    ADD CONSTRAINT cost_material_line_pkey PRIMARY KEY (id);


--
-- Name: cost_order_result cost_order_result_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.cost_order_result
    ADD CONSTRAINT cost_order_result_pkey PRIMARY KEY (run_id, order_id);


--
-- Name: cost_run cost_run_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.cost_run
    ADD CONSTRAINT cost_run_pkey PRIMARY KEY (id);


--
-- Name: inventory_result inventory_result_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.inventory_result
    ADD CONSTRAINT inventory_result_pkey PRIMARY KEY (run_id, item_code);


--
-- Name: item_group item_group_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.item_group
    ADD CONSTRAINT item_group_pkey PRIMARY KEY (code);


--
-- Name: item item_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.item
    ADD CONSTRAINT item_pkey PRIMARY KEY (company_id, code);


--
-- Name: material_substitution material_substitution_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.material_substitution
    ADD CONSTRAINT material_substitution_pkey PRIMARY KEY (id);


--
-- Name: opening_balance opening_balance_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.opening_balance
    ADD CONSTRAINT opening_balance_pkey PRIMARY KEY (company_id, period, item_code);


--
-- Name: order_material_adjustment order_material_adjustment_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.order_material_adjustment
    ADD CONSTRAINT order_material_adjustment_pkey PRIMARY KEY (id);


--
-- Name: period_cost period_cost_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.period_cost
    ADD CONSTRAINT period_cost_pkey PRIMARY KEY (company_id, period, cost_code);


--
-- Name: period_lock period_lock_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.period_lock
    ADD CONSTRAINT period_lock_pkey PRIMARY KEY (company_id, period);


--
-- Name: production_capacity production_capacity_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.production_capacity
    ADD CONSTRAINT production_capacity_pkey PRIMARY KEY (id);


--
-- Name: production_order production_order_company_id_id_key; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.production_order
    ADD CONSTRAINT production_order_company_id_id_key UNIQUE (company_id, id);


--
-- Name: production_order production_order_company_id_order_code_key; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.production_order
    ADD CONSTRAINT production_order_company_id_order_code_key UNIQUE (company_id, order_code);


--
-- Name: production_order production_order_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.production_order
    ADD CONSTRAINT production_order_pkey PRIMARY KEY (id);


--
-- Name: production_plan production_plan_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.production_plan
    ADD CONSTRAINT production_plan_pkey PRIMARY KEY (id);


--
-- Name: purchase purchase_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.purchase
    ADD CONSTRAINT purchase_pkey PRIMARY KEY (id);


--
-- Name: risk_threshold risk_threshold_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.risk_threshold
    ADD CONSTRAINT risk_threshold_pkey PRIMARY KEY (company_id, risk_key);


--
-- Name: sale sale_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.sale
    ADD CONSTRAINT sale_pkey PRIMARY KEY (id);


--
-- Name: work_calendar work_calendar_pkey; Type: CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.work_calendar
    ADD CONSTRAINT work_calendar_pkey PRIMARY KEY (company_id, day);


--
-- Name: ix_adj_order; Type: INDEX; Schema: giathanh; Owner: -
--

CREATE INDEX ix_adj_order ON giathanh.order_material_adjustment USING btree (order_id);


--
-- Name: ix_bom_material; Type: INDEX; Schema: giathanh; Owner: -
--

CREATE INDEX ix_bom_material ON giathanh.bom_line USING btree (company_id, material_code);


--
-- Name: ix_bom_product; Type: INDEX; Schema: giathanh; Owner: -
--

CREATE INDEX ix_bom_product ON giathanh.bom_line USING btree (company_id, product_code, bom_type);


--
-- Name: ix_cml_run; Type: INDEX; Schema: giathanh; Owner: -
--

CREATE INDEX ix_cml_run ON giathanh.cost_material_line USING btree (run_id, order_id);


--
-- Name: ix_issue_date; Type: INDEX; Schema: giathanh; Owner: -
--

CREATE INDEX ix_issue_date ON giathanh.common_issue USING btree (company_id, issue_date);


--
-- Name: ix_order_date; Type: INDEX; Schema: giathanh; Owner: -
--

CREATE INDEX ix_order_date ON giathanh.production_order USING btree (company_id, material_issue_date);


--
-- Name: ix_order_product; Type: INDEX; Schema: giathanh; Owner: -
--

CREATE INDEX ix_order_product ON giathanh.production_order USING btree (company_id, product_code);


--
-- Name: ix_plan_date; Type: INDEX; Schema: giathanh; Owner: -
--

CREATE INDEX ix_plan_date ON giathanh.production_plan USING btree (company_id, production_date);


--
-- Name: ix_purchase_date; Type: INDEX; Schema: giathanh; Owner: -
--

CREATE INDEX ix_purchase_date ON giathanh.purchase USING btree (company_id, receipt_date);


--
-- Name: ix_purchase_invoice; Type: INDEX; Schema: giathanh; Owner: -
--

CREATE INDEX ix_purchase_invoice ON giathanh.purchase USING btree (company_id, invoice_no) WHERE ((invoice_no IS NOT NULL) AND (invoice_no <> ''::text));


--
-- Name: ix_purchase_item; Type: INDEX; Schema: giathanh; Owner: -
--

CREATE INDEX ix_purchase_item ON giathanh.purchase USING btree (company_id, item_code, receipt_date);


--
-- Name: ix_run_period; Type: INDEX; Schema: giathanh; Owner: -
--

CREATE INDEX ix_run_period ON giathanh.cost_run USING btree (company_id, period, calculated_at DESC);


--
-- Name: ix_sale_date; Type: INDEX; Schema: giathanh; Owner: -
--

CREATE INDEX ix_sale_date ON giathanh.sale USING btree (company_id, invoice_date);


--
-- Name: ix_sale_item; Type: INDEX; Schema: giathanh; Owner: -
--

CREATE INDEX ix_sale_item ON giathanh.sale USING btree (company_id, item_code, invoice_date);


--
-- Name: bom_line trg_bom_line_updated; Type: TRIGGER; Schema: giathanh; Owner: -
--

CREATE TRIGGER trg_bom_line_updated BEFORE UPDATE ON giathanh.bom_line FOR EACH ROW EXECUTE FUNCTION giathanh.set_updated_at();


--
-- Name: company_setting trg_company_setting_updated; Type: TRIGGER; Schema: giathanh; Owner: -
--

CREATE TRIGGER trg_company_setting_updated BEFORE UPDATE ON giathanh.company_setting FOR EACH ROW EXECUTE FUNCTION giathanh.set_updated_at();


--
-- Name: company trg_company_updated; Type: TRIGGER; Schema: giathanh; Owner: -
--

CREATE TRIGGER trg_company_updated BEFORE UPDATE ON giathanh.company FOR EACH ROW EXECUTE FUNCTION giathanh.set_updated_at();


--
-- Name: item trg_item_updated; Type: TRIGGER; Schema: giathanh; Owner: -
--

CREATE TRIGGER trg_item_updated BEFORE UPDATE ON giathanh.item FOR EACH ROW EXECUTE FUNCTION giathanh.set_updated_at();


--
-- Name: production_order trg_production_order_updated; Type: TRIGGER; Schema: giathanh; Owner: -
--

CREATE TRIGGER trg_production_order_updated BEFORE UPDATE ON giathanh.production_order FOR EACH ROW EXECUTE FUNCTION giathanh.set_updated_at();


--
-- Name: purchase trg_purchase_updated; Type: TRIGGER; Schema: giathanh; Owner: -
--

CREATE TRIGGER trg_purchase_updated BEFORE UPDATE ON giathanh.purchase FOR EACH ROW EXECUTE FUNCTION giathanh.set_updated_at();


--
-- Name: sale trg_sale_updated; Type: TRIGGER; Schema: giathanh; Owner: -
--

CREATE TRIGGER trg_sale_updated BEFORE UPDATE ON giathanh.sale FOR EACH ROW EXECUTE FUNCTION giathanh.set_updated_at();


--
-- Name: bom_line bom_line_company_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.bom_line
    ADD CONSTRAINT bom_line_company_id_fkey FOREIGN KEY (company_id) REFERENCES giathanh.company(id) ON DELETE CASCADE;


--
-- Name: bom_line bom_line_company_id_material_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.bom_line
    ADD CONSTRAINT bom_line_company_id_material_code_fkey FOREIGN KEY (company_id, material_code) REFERENCES giathanh.item(company_id, code);


--
-- Name: bom_line bom_line_company_id_product_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.bom_line
    ADD CONSTRAINT bom_line_company_id_product_code_fkey FOREIGN KEY (company_id, product_code) REFERENCES giathanh.item(company_id, code);


--
-- Name: bom_line bom_line_company_id_substitute_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.bom_line
    ADD CONSTRAINT bom_line_company_id_substitute_code_fkey FOREIGN KEY (company_id, substitute_code) REFERENCES giathanh.item(company_id, code);


--
-- Name: common_issue common_issue_company_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.common_issue
    ADD CONSTRAINT common_issue_company_id_fkey FOREIGN KEY (company_id) REFERENCES giathanh.company(id) ON DELETE CASCADE;


--
-- Name: common_issue common_issue_company_id_item_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.common_issue
    ADD CONSTRAINT common_issue_company_id_item_code_fkey FOREIGN KEY (company_id, item_code) REFERENCES giathanh.item(company_id, code);


--
-- Name: company_setting company_setting_company_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.company_setting
    ADD CONSTRAINT company_setting_company_id_fkey FOREIGN KEY (company_id) REFERENCES giathanh.company(id) ON DELETE CASCADE;


--
-- Name: cost_column cost_column_company_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.cost_column
    ADD CONSTRAINT cost_column_company_id_fkey FOREIGN KEY (company_id) REFERENCES giathanh.company(id) ON DELETE CASCADE;


--
-- Name: cost_material_line cost_material_line_company_id_item_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.cost_material_line
    ADD CONSTRAINT cost_material_line_company_id_item_code_fkey FOREIGN KEY (company_id, item_code) REFERENCES giathanh.item(company_id, code);


--
-- Name: cost_material_line cost_material_line_run_id_order_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.cost_material_line
    ADD CONSTRAINT cost_material_line_run_id_order_id_fkey FOREIGN KEY (run_id, order_id) REFERENCES giathanh.cost_order_result(run_id, order_id) ON DELETE CASCADE;


--
-- Name: cost_order_result cost_order_result_order_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.cost_order_result
    ADD CONSTRAINT cost_order_result_order_id_fkey FOREIGN KEY (order_id) REFERENCES giathanh.production_order(id) ON DELETE CASCADE;


--
-- Name: cost_order_result cost_order_result_run_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.cost_order_result
    ADD CONSTRAINT cost_order_result_run_id_fkey FOREIGN KEY (run_id) REFERENCES giathanh.cost_run(id) ON DELETE CASCADE;


--
-- Name: cost_run cost_run_company_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.cost_run
    ADD CONSTRAINT cost_run_company_id_fkey FOREIGN KEY (company_id) REFERENCES giathanh.company(id) ON DELETE CASCADE;


--
-- Name: inventory_result inventory_result_company_id_item_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.inventory_result
    ADD CONSTRAINT inventory_result_company_id_item_code_fkey FOREIGN KEY (company_id, item_code) REFERENCES giathanh.item(company_id, code);


--
-- Name: inventory_result inventory_result_run_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.inventory_result
    ADD CONSTRAINT inventory_result_run_id_fkey FOREIGN KEY (run_id) REFERENCES giathanh.cost_run(id) ON DELETE CASCADE;


--
-- Name: item item_company_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.item
    ADD CONSTRAINT item_company_id_fkey FOREIGN KEY (company_id) REFERENCES giathanh.company(id) ON DELETE CASCADE;


--
-- Name: item item_group_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.item
    ADD CONSTRAINT item_group_code_fkey FOREIGN KEY (group_code) REFERENCES giathanh.item_group(code);


--
-- Name: material_substitution material_substitution_company_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.material_substitution
    ADD CONSTRAINT material_substitution_company_id_fkey FOREIGN KEY (company_id) REFERENCES giathanh.company(id) ON DELETE CASCADE;


--
-- Name: material_substitution material_substitution_company_id_material_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.material_substitution
    ADD CONSTRAINT material_substitution_company_id_material_code_fkey FOREIGN KEY (company_id, material_code) REFERENCES giathanh.item(company_id, code);


--
-- Name: material_substitution material_substitution_company_id_product_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.material_substitution
    ADD CONSTRAINT material_substitution_company_id_product_code_fkey FOREIGN KEY (company_id, product_code) REFERENCES giathanh.item(company_id, code);


--
-- Name: material_substitution material_substitution_company_id_substitute_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.material_substitution
    ADD CONSTRAINT material_substitution_company_id_substitute_code_fkey FOREIGN KEY (company_id, substitute_code) REFERENCES giathanh.item(company_id, code);


--
-- Name: opening_balance opening_balance_company_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.opening_balance
    ADD CONSTRAINT opening_balance_company_id_fkey FOREIGN KEY (company_id) REFERENCES giathanh.company(id) ON DELETE CASCADE;


--
-- Name: opening_balance opening_balance_company_id_item_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.opening_balance
    ADD CONSTRAINT opening_balance_company_id_item_code_fkey FOREIGN KEY (company_id, item_code) REFERENCES giathanh.item(company_id, code);


--
-- Name: order_material_adjustment order_material_adjustment_company_id_item_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.order_material_adjustment
    ADD CONSTRAINT order_material_adjustment_company_id_item_code_fkey FOREIGN KEY (company_id, item_code) REFERENCES giathanh.item(company_id, code);


--
-- Name: order_material_adjustment order_material_adjustment_company_id_order_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.order_material_adjustment
    ADD CONSTRAINT order_material_adjustment_company_id_order_id_fkey FOREIGN KEY (company_id, order_id) REFERENCES giathanh.production_order(company_id, id) ON DELETE CASCADE;


--
-- Name: period_cost period_cost_company_id_cost_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.period_cost
    ADD CONSTRAINT period_cost_company_id_cost_code_fkey FOREIGN KEY (company_id, cost_code) REFERENCES giathanh.cost_column(company_id, code);


--
-- Name: period_lock period_lock_company_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.period_lock
    ADD CONSTRAINT period_lock_company_id_fkey FOREIGN KEY (company_id) REFERENCES giathanh.company(id) ON DELETE CASCADE;


--
-- Name: production_capacity production_capacity_company_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.production_capacity
    ADD CONSTRAINT production_capacity_company_id_fkey FOREIGN KEY (company_id) REFERENCES giathanh.company(id) ON DELETE CASCADE;


--
-- Name: production_capacity production_capacity_company_id_product_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.production_capacity
    ADD CONSTRAINT production_capacity_company_id_product_code_fkey FOREIGN KEY (company_id, product_code) REFERENCES giathanh.item(company_id, code);


--
-- Name: production_order production_order_company_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.production_order
    ADD CONSTRAINT production_order_company_id_fkey FOREIGN KEY (company_id) REFERENCES giathanh.company(id) ON DELETE CASCADE;


--
-- Name: production_order production_order_company_id_product_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.production_order
    ADD CONSTRAINT production_order_company_id_product_code_fkey FOREIGN KEY (company_id, product_code) REFERENCES giathanh.item(company_id, code);


--
-- Name: production_plan production_plan_company_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.production_plan
    ADD CONSTRAINT production_plan_company_id_fkey FOREIGN KEY (company_id) REFERENCES giathanh.company(id) ON DELETE CASCADE;


--
-- Name: production_plan production_plan_company_id_product_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.production_plan
    ADD CONSTRAINT production_plan_company_id_product_code_fkey FOREIGN KEY (company_id, product_code) REFERENCES giathanh.item(company_id, code);


--
-- Name: purchase purchase_company_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.purchase
    ADD CONSTRAINT purchase_company_id_fkey FOREIGN KEY (company_id) REFERENCES giathanh.company(id) ON DELETE CASCADE;


--
-- Name: purchase purchase_company_id_item_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.purchase
    ADD CONSTRAINT purchase_company_id_item_code_fkey FOREIGN KEY (company_id, item_code) REFERENCES giathanh.item(company_id, code);


--
-- Name: risk_threshold risk_threshold_company_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.risk_threshold
    ADD CONSTRAINT risk_threshold_company_id_fkey FOREIGN KEY (company_id) REFERENCES giathanh.company(id) ON DELETE CASCADE;


--
-- Name: sale sale_company_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.sale
    ADD CONSTRAINT sale_company_id_fkey FOREIGN KEY (company_id) REFERENCES giathanh.company(id) ON DELETE CASCADE;


--
-- Name: sale sale_company_id_item_code_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.sale
    ADD CONSTRAINT sale_company_id_item_code_fkey FOREIGN KEY (company_id, item_code) REFERENCES giathanh.item(company_id, code);


--
-- Name: work_calendar work_calendar_company_id_fkey; Type: FK CONSTRAINT; Schema: giathanh; Owner: -
--

ALTER TABLE ONLY giathanh.work_calendar
    ADD CONSTRAINT work_calendar_company_id_fkey FOREIGN KEY (company_id) REFERENCES giathanh.company(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict IT5WsfPzpeujXeLoAtT5KXbA24zQPBEiKmsuNRbFbW57Cxh5c2rI5AuBPSKB7We

