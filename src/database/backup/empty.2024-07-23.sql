--
-- PostgreSQL database dump
--

-- Dumped from database version 14.12 (Ubuntu 14.12-1.pgdg22.04+1ubuntu4)
-- Dumped by pg_dump version 14.9

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: chat_provider_user_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.chat_provider_user_type AS ENUM (
    'accessible',
    'responsible',
    'supervisor'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account (
    id integer NOT NULL,
    company_name character varying(255) NOT NULL,
    subdomain character varying(255) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    logo_id uuid
);


--
-- Name: account_api_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_api_access (
    account_id integer NOT NULL,
    api_key character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: account_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.account_id_seq
    AS integer
    START WITH 11023201
    INCREMENT BY 1
    MINVALUE 11023201
    NO MAXVALUE
    CACHE 1;


--
-- Name: account_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_settings (
    account_id integer NOT NULL,
    language character varying NOT NULL,
    working_days character varying,
    working_time_from time without time zone,
    working_time_to time without time zone,
    time_zone character varying,
    currency character varying(3) NOT NULL,
    number_format character varying,
    phone_format character varying DEFAULT 'international'::character varying NOT NULL,
    allow_duplicates boolean DEFAULT false NOT NULL
);


--
-- Name: account_subscription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_subscription (
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    expired_at timestamp without time zone,
    is_trial boolean NOT NULL,
    user_limit integer NOT NULL,
    plan_name character varying NOT NULL,
    external_customer_id character varying
);


--
-- Name: action; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action (
    id integer NOT NULL,
    type character varying(100) NOT NULL,
    delay integer,
    account_id integer NOT NULL
);


--
-- Name: action_activity_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_activity_settings (
    action_id integer NOT NULL,
    responsible_user_type character varying(100) NOT NULL,
    responsible_user_id integer,
    activity_type_id integer NOT NULL,
    text character varying NOT NULL,
    deadline_type character varying(100) NOT NULL,
    deadline_time integer,
    account_id integer NOT NULL
);


--
-- Name: action_email_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_email_settings (
    action_id integer NOT NULL,
    subject character varying NOT NULL,
    content character varying,
    send_as_html boolean NOT NULL,
    mailbox_id integer,
    user_id integer,
    account_id integer NOT NULL,
    signature character varying
);


--
-- Name: action_entity_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_entity_settings (
    action_id integer NOT NULL,
    stage_id integer NOT NULL,
    account_id integer NOT NULL,
    operation_type character varying DEFAULT 'move'::character varying NOT NULL
);


--
-- Name: action_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.action_id_seq
    AS integer
    START WITH 51011001
    INCREMENT BY 1
    MINVALUE 51011001
    NO MAXVALUE
    CACHE 1;


--
-- Name: action_scheduled; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_scheduled (
    id integer NOT NULL,
    action_id integer NOT NULL,
    entity_id integer NOT NULL,
    scheduled_time timestamp without time zone NOT NULL,
    completed boolean NOT NULL,
    account_id integer NOT NULL,
    created_by integer NOT NULL
);


--
-- Name: action_task_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_task_settings (
    action_id integer NOT NULL,
    responsible_user_type character varying(100) NOT NULL,
    responsible_user_id integer,
    title character varying NOT NULL,
    text character varying NOT NULL,
    deadline_type character varying(100) NOT NULL,
    deadline_time integer,
    account_id integer NOT NULL
);


--
-- Name: activity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity (
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    account_id integer NOT NULL,
    created_by integer NOT NULL,
    responsible_user_id integer NOT NULL,
    text character varying NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    is_resolved boolean NOT NULL,
    result character varying,
    activity_type_id integer NOT NULL,
    entity_id integer NOT NULL,
    resolved_date timestamp without time zone,
    weight double precision NOT NULL
);


--
-- Name: activity_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_type (
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    account_id integer NOT NULL,
    name character varying(128) NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: activity_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_type_id_seq
    AS integer
    START WITH 25022001
    INCREMENT BY 1
    MINVALUE 25022001
    NO MAXVALUE
    CACHE 1;


--
-- Name: task; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task (
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    account_id integer NOT NULL,
    created_by integer NOT NULL,
    responsible_user_id integer NOT NULL,
    text character varying NOT NULL,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    is_resolved boolean NOT NULL,
    title character varying NOT NULL,
    entity_id integer,
    stage_id integer,
    planned_time integer,
    settings_id integer,
    resolved_date timestamp without time zone,
    weight double precision NOT NULL,
    board_id integer
);


--
-- Name: all_tasks; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.all_tasks AS
 SELECT activity.id,
    activity.created_at,
    activity.account_id,
    activity.created_by,
    activity.responsible_user_id,
    activity.text,
    activity.start_date,
    activity.end_date,
    activity.is_resolved,
    activity.resolved_date,
    activity.result,
    activity.entity_id,
    activity.weight,
    activity.activity_type_id,
    NULL::character varying AS title,
    NULL::integer AS planned_time,
    NULL::integer AS settings_id,
    NULL::integer AS board_id,
    NULL::integer AS stage_id,
    'activity'::text AS type
   FROM public.activity
UNION
 SELECT task.id,
    task.created_at,
    task.account_id,
    task.created_by,
    task.responsible_user_id,
    task.text,
    task.start_date,
    task.end_date,
    task.is_resolved,
    task.resolved_date,
    NULL::character varying AS result,
    task.entity_id,
    task.weight,
    NULL::integer AS activity_type_id,
    task.title,
    task.planned_time,
    task.settings_id,
    task.board_id,
    task.stage_id,
    'task'::text AS type
   FROM public.task
  ORDER BY 1;


--
-- Name: appsumo_license; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appsumo_license (
    id integer NOT NULL,
    license_key text NOT NULL,
    license_status text NOT NULL,
    plan_id text NOT NULL,
    tier integer NOT NULL,
    account_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    prev_license_key text
);


--
-- Name: app_sumo_license_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.appsumo_license ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.app_sumo_license_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: appsumo_tier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appsumo_tier (
    id integer NOT NULL,
    tier integer NOT NULL,
    user_limit integer NOT NULL,
    term_in_days integer NOT NULL,
    plan_name text NOT NULL
);


--
-- Name: app_sumo_preset_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.appsumo_tier ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.app_sumo_preset_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: automation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automation (
    id integer NOT NULL,
    trigger_id integer NOT NULL,
    action_id integer NOT NULL,
    created_by integer NOT NULL,
    is_active boolean NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: automation_condition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automation_condition (
    automation_id integer NOT NULL,
    condition_id integer NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: automation_entity_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automation_entity_type (
    id integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer NOT NULL,
    name text NOT NULL,
    triggers text NOT NULL,
    entity_type_id integer NOT NULL,
    board_id integer,
    stage_id integer,
    conditions jsonb,
    actions jsonb,
    process_id integer
);


--
-- Name: automation_entity_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.automation_entity_type ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.automation_entity_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: automation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.automation_id_seq
    AS integer
    START WITH 51011001
    INCREMENT BY 1
    MINVALUE 51011001
    NO MAXVALUE
    CACHE 1;


--
-- Name: automation_process; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automation_process (
    id integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    resource_key text,
    bpmn_file text,
    bpmn_process_id text
);


--
-- Name: automation_process_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.automation_process ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.automation_process_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: automation_stage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automation_stage (
    automation_id integer NOT NULL,
    stage_id integer NOT NULL
);


--
-- Name: board; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.board (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    record_id integer,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    sort_order smallint DEFAULT 0 NOT NULL,
    is_system boolean DEFAULT false NOT NULL,
    code character varying(255),
    need_migration boolean DEFAULT false,
    task_board_id integer,
    owner_id integer,
    participant_ids jsonb
);


--
-- Name: board_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.board_id_seq
    AS integer
    START WITH 14022001
    INCREMENT BY 1
    MINVALUE 14022001
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat (
    id integer NOT NULL,
    provider_id integer NOT NULL,
    created_by integer,
    external_id character varying,
    type character varying NOT NULL,
    title character varying,
    entity_id integer,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: chat_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_message (
    id integer NOT NULL,
    chat_id integer NOT NULL,
    chat_user_id integer NOT NULL,
    external_id character varying,
    text character varying NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    reply_to_id integer
);


--
-- Name: chat_message_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_message_file (
    id integer NOT NULL,
    message_id integer NOT NULL,
    external_id character varying,
    account_id integer NOT NULL,
    file_id uuid,
    name character varying NOT NULL,
    mime_type character varying NOT NULL,
    size integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: chat_message_file_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_message_file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_message_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_message_reaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_message_reaction (
    id integer NOT NULL,
    message_id integer NOT NULL,
    chat_user_id integer NOT NULL,
    reaction character varying NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: chat_message_reaction_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_message_reaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_message_user_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_message_user_status (
    chat_id integer NOT NULL,
    message_id integer NOT NULL,
    chat_user_id integer NOT NULL,
    status character varying NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: chat_pinned_message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_pinned_message (
    chat_id integer NOT NULL,
    message_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: chat_provider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_provider (
    id integer NOT NULL,
    created_by integer NOT NULL,
    type character varying NOT NULL,
    title character varying,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    status character varying DEFAULT 'draft'::character varying NOT NULL,
    transport character varying NOT NULL
);


--
-- Name: chat_provider_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_provider_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_provider_messenger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_provider_messenger (
    provider_id integer NOT NULL,
    page_id character varying NOT NULL,
    page_access_token character varying NOT NULL,
    account_id integer NOT NULL,
    user_id character varying NOT NULL,
    user_access_token character varying NOT NULL
);


--
-- Name: chat_provider_twilio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_provider_twilio (
    provider_id integer NOT NULL,
    account_sid character varying NOT NULL,
    auth_token character varying NOT NULL,
    phone_number character varying NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: chat_provider_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_provider_user (
    provider_id integer NOT NULL,
    user_id integer NOT NULL,
    account_id integer NOT NULL,
    type public.chat_provider_user_type DEFAULT 'accessible'::public.chat_provider_user_type NOT NULL
);


--
-- Name: chat_provider_wazzup; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_provider_wazzup (
    provider_id integer NOT NULL,
    account_id integer NOT NULL,
    api_key character varying NOT NULL,
    channel_id character varying NOT NULL,
    plain_id character varying NOT NULL,
    transport character varying NOT NULL
);


--
-- Name: chat_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_user (
    id integer NOT NULL,
    chat_id integer NOT NULL,
    user_id integer,
    role character varying NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: chat_user_external; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_user_external (
    account_id integer NOT NULL,
    external_id character varying NOT NULL,
    first_name character varying,
    last_name character varying,
    avatar_url character varying,
    phone character varying,
    email character varying,
    link character varying,
    chat_user_id integer NOT NULL
);


--
-- Name: chat_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: condition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.condition (
    id integer NOT NULL,
    type character varying(100) NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: condition_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.condition_id_seq
    AS integer
    START WITH 51011001
    INCREMENT BY 1
    MINVALUE 51011001
    NO MAXVALUE
    CACHE 1;


--
-- Name: demo_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.demo_data (
    id integer NOT NULL,
    account_id integer NOT NULL,
    type character varying NOT NULL,
    ids character varying NOT NULL
);


--
-- Name: demo_data_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.demo_data ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.demo_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: department; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.department (
    id integer NOT NULL,
    name character varying NOT NULL,
    parent_id integer,
    account_id integer NOT NULL
);


--
-- Name: department_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: document_template; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_template (
    id integer NOT NULL,
    name character varying NOT NULL,
    created_by integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    created_count integer DEFAULT 0 NOT NULL
);


--
-- Name: document_template_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_template_access (
    document_template_id integer NOT NULL,
    user_id integer NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: document_template_entity_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_template_entity_type (
    document_template_id integer NOT NULL,
    entity_type_id integer NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: document_template_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.document_template_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: entity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    entity_type_id integer NOT NULL,
    responsible_user_id integer NOT NULL,
    stage_id integer,
    created_by integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    participant_ids jsonb,
    weight double precision NOT NULL,
    closed_at timestamp without time zone,
    copied_from integer,
    copied_count integer
);


--
-- Name: entity_event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_event (
    id integer NOT NULL,
    account_id integer NOT NULL,
    entity_id integer NOT NULL,
    object_id integer NOT NULL,
    type character varying NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: entity_event_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.entity_event ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.entity_event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: entity_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entity_id_seq
    AS integer
    START WITH 14022001
    INCREMENT BY 1
    MINVALUE 14022001
    NO MAXVALUE
    CACHE 1;


--
-- Name: entity_link; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_link (
    id integer NOT NULL,
    source_id integer NOT NULL,
    target_id integer NOT NULL,
    sort_order smallint NOT NULL,
    back_link_id integer,
    account_id integer NOT NULL
);


--
-- Name: entity_link_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entity_link_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: entity_list_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_list_settings (
    id integer NOT NULL,
    entity_type_id integer NOT NULL,
    board_id integer,
    settings jsonb NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: entity_list_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entity_list_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: entity_stage_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_stage_history (
    id integer NOT NULL,
    account_id integer NOT NULL,
    entity_id integer NOT NULL,
    board_id integer NOT NULL,
    stage_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: entity_stage_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.entity_stage_history ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.entity_stage_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: entity_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_type (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    entity_category character varying(50) NOT NULL,
    section_name character varying(100) NOT NULL,
    section_view character varying(50) NOT NULL,
    section_icon character varying(50) NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    sort_order smallint DEFAULT 0 NOT NULL
);


--
-- Name: entity_type_feature; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_type_feature (
    entity_type_id integer NOT NULL,
    feature_id smallint NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: entity_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entity_type_id_seq
    AS integer
    START WITH 13022001
    INCREMENT BY 1
    MINVALUE 13022001
    NO MAXVALUE
    CACHE 1;


--
-- Name: entity_type_link_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entity_type_link_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: entity_type_link; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_type_link (
    id integer DEFAULT nextval('public.entity_type_link_id_seq'::regclass) NOT NULL,
    source_id integer NOT NULL,
    target_id integer NOT NULL,
    sort_order smallint NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: exact_time_trigger_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exact_time_trigger_settings (
    trigger_id integer NOT NULL,
    date timestamp without time zone NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: external_entity_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.external_entity_id_seq
    START WITH 30022001
    INCREMENT BY 1
    MINVALUE 30022001
    NO MAXVALUE
    CACHE 1;


--
-- Name: external_entity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.external_entity (
    id integer DEFAULT nextval('public.external_entity_id_seq'::regclass) NOT NULL,
    entity_id integer NOT NULL,
    url character varying NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    system smallint,
    raw_data jsonb,
    ui_data jsonb
);


--
-- Name: external_system; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.external_system (
    id smallint NOT NULL,
    name character varying NOT NULL,
    code character varying NOT NULL,
    url_templates character varying[] NOT NULL
);


--
-- Name: external_system_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.external_system ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.external_system_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: feature; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feature (
    id smallint NOT NULL,
    name character varying NOT NULL,
    code character varying NOT NULL,
    is_enabled boolean NOT NULL
);


--
-- Name: feature_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.feature ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.feature_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: feed_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.feed_item_id_seq
    AS integer
    START WITH 22022001
    INCREMENT BY 1
    MINVALUE 22022001
    NO MAXVALUE
    CACHE 1;


--
-- Name: file_link; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.file_link (
    id integer NOT NULL,
    account_id integer NOT NULL,
    source_type character varying NOT NULL,
    source_id integer NOT NULL,
    file_id uuid NOT NULL,
    file_name character varying NOT NULL,
    file_size integer NOT NULL,
    file_type character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    created_by integer NOT NULL
);


--
-- Name: mail_message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mail_message (
    id integer NOT NULL,
    mailbox_id integer NOT NULL,
    external_id character varying NOT NULL,
    thread_id character varying NOT NULL,
    snippet character varying,
    sent_from character varying NOT NULL,
    sent_to character varying,
    subject character varying,
    date timestamp without time zone NOT NULL,
    account_id integer NOT NULL,
    reply_to character varying,
    cc character varying,
    has_attachment boolean DEFAULT false NOT NULL,
    message_id character varying,
    references_to character varying,
    in_reply_to character varying,
    entity_id integer,
    is_seen boolean DEFAULT false NOT NULL
);


--
-- Name: note; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.note (
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    text character varying NOT NULL,
    entity_id integer NOT NULL,
    created_by integer NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: feed_items; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.feed_items AS
 SELECT note.id,
    note.created_at,
    note.entity_id,
    'note'::text AS type
   FROM public.note
UNION
 SELECT task.id,
    task.created_at,
    task.entity_id,
    'task'::text AS type
   FROM public.task
UNION
 SELECT activity.id,
    activity.created_at,
    activity.entity_id,
    'activity'::text AS type
   FROM public.activity
UNION
( SELECT max(message.id) AS id,
    max(message.date) AS created_at,
    message.entity_id,
    'mail'::text AS type
   FROM public.mail_message message
  WHERE (message.entity_id IS NOT NULL)
  GROUP BY message.thread_id, message.entity_id
  ORDER BY (max(message.date)) DESC)
UNION
( SELECT max(message.id) AS id,
    max(message.date) AS created_at,
    el.source_id AS entity_id,
    'mail'::text AS type
   FROM (public.mail_message message
     RIGHT JOIN public.entity_link el ON ((el.target_id = message.entity_id)))
  WHERE (message.entity_id IS NOT NULL)
  GROUP BY message.thread_id, el.source_id
  ORDER BY (max(message.date)) DESC)
UNION
 SELECT fl.id,
    fl.created_at,
    fl.source_id AS entity_id,
    'document'::text AS type
   FROM public.file_link fl
  WHERE ((fl.source_type)::text = 'entity_document'::text)
  ORDER BY 2 DESC;


--
-- Name: field; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.field (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    sort_order smallint NOT NULL,
    entity_type_id integer NOT NULL,
    field_group_id integer,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    code character varying(255),
    active boolean DEFAULT true NOT NULL,
    value character varying
);


--
-- Name: field_condition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.field_condition (
    condition_id integer NOT NULL,
    field_id integer NOT NULL,
    field_type character varying(50) NOT NULL,
    payload jsonb NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: field_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.field_group (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    sort_order smallint NOT NULL,
    entity_type_id integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: field_group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.field_group_id_seq
    AS integer
    START WITH 41022001
    INCREMENT BY 1
    MINVALUE 41022001
    NO MAXVALUE
    CACHE 1;


--
-- Name: field_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.field_id_seq
    AS integer
    START WITH 42022001
    INCREMENT BY 1
    MINVALUE 42022001
    NO MAXVALUE
    CACHE 1;


--
-- Name: field_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.field_option (
    id integer NOT NULL,
    label character varying(255) NOT NULL,
    sort_order smallint NOT NULL,
    field_id integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    color character varying(50)
);


--
-- Name: field_option_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.field_option_id_seq
    AS integer
    START WITH 43022001
    INCREMENT BY 1
    MINVALUE 43022001
    NO MAXVALUE
    CACHE 1;


--
-- Name: field_stage_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.field_stage_settings (
    id integer NOT NULL,
    account_id integer NOT NULL,
    field_id integer NOT NULL,
    stage_id integer NOT NULL,
    access character varying NOT NULL,
    exclude_user_ids integer[]
);


--
-- Name: field_stage_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.field_stage_settings ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.field_stage_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: field_user_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.field_user_settings (
    id integer NOT NULL,
    account_id integer NOT NULL,
    field_id integer NOT NULL,
    user_id integer NOT NULL,
    access character varying NOT NULL
);


--
-- Name: field_user_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.field_user_settings ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.field_user_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: field_value; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.field_value (
    id integer NOT NULL,
    field_id integer NOT NULL,
    payload jsonb NOT NULL,
    entity_id integer NOT NULL,
    account_id integer NOT NULL,
    field_type character varying(50) NOT NULL
);


--
-- Name: field_value_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.field_value_id_seq
    AS integer
    START WITH 44022001
    INCREMENT BY 1
    MINVALUE 44022001
    NO MAXVALUE
    CACHE 1;


--
-- Name: file_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.file_info (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    created_by integer,
    original_name character varying NOT NULL,
    mime_type character varying NOT NULL,
    size integer NOT NULL,
    store_path character varying NOT NULL,
    is_used boolean DEFAULT false NOT NULL,
    hash_sha256 character varying
);


--
-- Name: file_link_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.file_link ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.file_link_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: industry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.industry (
    code character varying NOT NULL,
    name character varying NOT NULL,
    color character varying NOT NULL,
    sort_order smallint NOT NULL,
    active boolean NOT NULL
);


--
-- Name: mail_message_folder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mail_message_folder (
    message_id integer NOT NULL,
    folder_id integer NOT NULL
);


--
-- Name: mail_message_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mail_message_id_seq
    AS integer
    START WITH 28023001
    INCREMENT BY 1
    MINVALUE 28023001
    NO MAXVALUE
    CACHE 1;


--
-- Name: mail_message_payload; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mail_message_payload (
    id integer NOT NULL,
    message_id integer NOT NULL,
    mime_type character varying NOT NULL,
    filename character varying,
    attachment character varying,
    content character varying,
    account_id integer NOT NULL,
    sort_order smallint NOT NULL,
    size integer,
    external_id character varying
);


--
-- Name: mail_message_payload_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mail_message_payload_id_seq
    AS integer
    START WITH 29023001
    INCREMENT BY 1
    MINVALUE 29023001
    NO MAXVALUE
    CACHE 1;


--
-- Name: mailbox; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mailbox (
    id integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    email character varying NOT NULL,
    provider character varying NOT NULL,
    owner_id integer,
    create_contact boolean NOT NULL,
    state character varying NOT NULL,
    contact_entity_type_id integer,
    lead_entity_type_id integer,
    lead_board_id integer,
    error_message character varying,
    emails_per_day smallint,
    create_lead boolean DEFAULT false NOT NULL
);


--
-- Name: mailbox_accessible_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mailbox_accessible_user (
    mailbox_id integer NOT NULL,
    user_id integer NOT NULL,
    account_id integer
);


--
-- Name: mailbox_folder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mailbox_folder (
    id integer NOT NULL,
    mailbox_id integer NOT NULL,
    external_id character varying NOT NULL,
    name character varying NOT NULL,
    type character varying,
    account_id integer NOT NULL,
    messages_total integer,
    messages_unread integer
);


--
-- Name: mailbox_folder_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mailbox_folder_id_seq
    AS integer
    START WITH 31023001
    INCREMENT BY 1
    MINVALUE 31023001
    NO MAXVALUE
    CACHE 1;


--
-- Name: mailbox_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mailbox_id_seq
    AS integer
    START WITH 27023001
    INCREMENT BY 1
    MINVALUE 27023001
    NO MAXVALUE
    CACHE 1;


--
-- Name: mailbox_settings_gmail; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mailbox_settings_gmail (
    mailbox_id integer NOT NULL,
    account_id integer NOT NULL,
    tokens jsonb NOT NULL,
    history_id character varying
);


--
-- Name: mailbox_settings_manual; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mailbox_settings_manual (
    mailbox_id integer NOT NULL,
    account_id integer NOT NULL,
    password character varying NOT NULL,
    imap_server character varying NOT NULL,
    imap_port smallint NOT NULL,
    imap_secure boolean NOT NULL,
    smtp_server character varying NOT NULL,
    smtp_port smallint NOT NULL,
    smtp_secure boolean NOT NULL,
    imap_sync jsonb
);


--
-- Name: mailbox_signature; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mailbox_signature (
    id integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    name character varying NOT NULL,
    text character varying NOT NULL,
    created_by integer NOT NULL
);


--
-- Name: mailbox_signature_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mailbox_signature_id_seq
    AS integer
    START WITH 27023001
    INCREMENT BY 1
    MINVALUE 27023001
    NO MAXVALUE
    CACHE 1;


--
-- Name: mailbox_signature_link; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mailbox_signature_link (
    account_id integer NOT NULL,
    signature_id integer NOT NULL,
    mailbox_id integer NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification (
    id integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    type character varying NOT NULL,
    object_id integer NOT NULL,
    entity_id integer,
    from_user integer,
    title character varying,
    description character varying,
    is_seen boolean DEFAULT false NOT NULL,
    user_id integer NOT NULL,
    starts_in integer
);


--
-- Name: notification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notification_id_seq
    AS integer
    START WITH 61011001
    INCREMENT BY 1
    MINVALUE 61011001
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_settings (
    id integer NOT NULL,
    account_id integer NOT NULL,
    user_id integer NOT NULL,
    enable_popup boolean DEFAULT true NOT NULL
);


--
-- Name: notification_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notification_settings_id_seq
    AS integer
    START WITH 62011001
    INCREMENT BY 1
    MINVALUE 62011001
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_type_follow_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_type_follow_user (
    type_id integer NOT NULL,
    user_id integer NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: notification_type_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_type_settings (
    id integer NOT NULL,
    account_id integer NOT NULL,
    settings_id integer NOT NULL,
    type character varying NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    object_id integer,
    before integer
);


--
-- Name: notification_type_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notification_type_settings_id_seq
    AS integer
    START WITH 63011001
    INCREMENT BY 1
    MINVALUE 63011001
    NO MAXVALUE
    CACHE 1;


--
-- Name: object_permission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.object_permission (
    id integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    object_type character varying NOT NULL,
    object_id integer,
    create_permission character varying NOT NULL,
    view_permission character varying NOT NULL,
    edit_permission character varying NOT NULL,
    delete_permission character varying NOT NULL
);


--
-- Name: object_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.object_permission ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.object_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: order_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_item (
    id integer NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    quantity integer NOT NULL,
    tax numeric(5,2) NOT NULL,
    discount numeric(5,2) NOT NULL,
    product_id integer NOT NULL,
    order_id integer NOT NULL,
    sort_order smallint NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_status (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    color character varying(50) NOT NULL,
    code character varying(50),
    sort_order smallint NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: order_status_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    total_amount numeric(15,2) NOT NULL,
    currency character varying(3) NOT NULL,
    entity_id integer NOT NULL,
    created_by integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    tax_included boolean DEFAULT true NOT NULL,
    status_id integer,
    warehouse_id integer,
    section_id integer NOT NULL,
    order_number integer NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    cancel_after integer
);


--
-- Name: product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying,
    sku character varying,
    unit character varying,
    tax smallint,
    is_deleted boolean NOT NULL,
    category_id integer,
    created_by integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    type character varying(50) DEFAULT 'product'::character varying NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    section_id integer NOT NULL
);


--
-- Name: product_category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_category (
    id integer NOT NULL,
    name character varying NOT NULL,
    parent_id integer,
    created_by integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    section_id integer NOT NULL
);


--
-- Name: product_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_section; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products_section (
    id integer NOT NULL,
    name character varying NOT NULL,
    icon character varying NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    type character varying DEFAULT 'sale'::character varying NOT NULL,
    enable_warehouse boolean NOT NULL,
    enable_barcode boolean DEFAULT true NOT NULL,
    cancel_after integer
);


--
-- Name: product_module_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.products_section ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_module_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: product_price; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_price (
    id integer NOT NULL,
    name character varying,
    unit_price numeric(15,2),
    currency character varying(3) NOT NULL,
    product_id integer NOT NULL,
    account_id integer NOT NULL,
    max_discount integer
);


--
-- Name: product_price_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_price_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_stock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_stock (
    product_id integer NOT NULL,
    warehouse_id integer NOT NULL,
    stock_quantity integer NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: products_section_entity_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products_section_entity_type (
    section_id integer NOT NULL,
    entity_type_id integer NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: ready_made_solution; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ready_made_solution (
    code character varying NOT NULL,
    name character varying NOT NULL,
    subdomain character varying NOT NULL,
    sort_order smallint NOT NULL,
    active boolean NOT NULL,
    industry_code character varying,
    account_id integer
);


--
-- Name: rental_event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rental_event (
    id integer NOT NULL,
    product_id integer NOT NULL,
    order_item_id integer NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    status character varying NOT NULL,
    account_id integer NOT NULL,
    section_id integer NOT NULL
);


--
-- Name: rental_interval; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rental_interval (
    id integer NOT NULL,
    section_id integer NOT NULL,
    type character varying NOT NULL,
    start_time time without time zone,
    account_id integer NOT NULL
);


--
-- Name: rental_interval_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.rental_interval ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.rental_interval_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rental_order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rental_order (
    id integer NOT NULL,
    section_id integer NOT NULL,
    warehouse_id integer,
    entity_id integer NOT NULL,
    created_by integer NOT NULL,
    status character varying NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    currency character varying NOT NULL,
    tax_included boolean DEFAULT true NOT NULL,
    order_number integer NOT NULL
);


--
-- Name: rental_order_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.rental_order ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.rental_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rental_order_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rental_order_item (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    sort_order integer NOT NULL,
    account_id integer NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    tax numeric(5,2) NOT NULL,
    discount numeric(5,2) NOT NULL
);


--
-- Name: rental_order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.rental_order_item ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.rental_order_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rental_order_period; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rental_order_period (
    id integer NOT NULL,
    order_id integer NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: rental_order_period_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.rental_order_period ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.rental_order_period_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rental_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.rental_event ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.rental_schedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservation (
    id integer NOT NULL,
    order_id integer NOT NULL,
    order_item_id integer NOT NULL,
    product_id integer NOT NULL,
    warehouse_id integer NOT NULL,
    quantity integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: reservation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reservation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sales_plan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_plan (
    id integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    entity_type_id integer NOT NULL,
    user_id integer NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    quantity integer,
    amount integer
);


--
-- Name: sales_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.sales_plan ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.sales_plan_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: salesforce_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salesforce_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    domain character varying NOT NULL,
    key character varying NOT NULL,
    secret character varying NOT NULL,
    refresh_token character varying
);


--
-- Name: schedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule (
    id integer NOT NULL,
    name character varying NOT NULL,
    entity_type_id integer,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    products_section_id integer,
    icon character varying DEFAULT ''::character varying NOT NULL,
    time_period integer,
    appointment_limit integer,
    type character varying DEFAULT 'schedule'::character varying NOT NULL
);


--
-- Name: schedule_appointment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_appointment (
    id integer NOT NULL,
    schedule_id integer NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    status character varying NOT NULL,
    comment character varying,
    owner_id integer NOT NULL,
    entity_id integer,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    order_id integer,
    title character varying,
    performer_id integer NOT NULL
);


--
-- Name: schedule_event_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.schedule_appointment ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.schedule_event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.schedule ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.schedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: schedule_performer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_performer (
    schedule_id integer NOT NULL,
    user_id integer,
    account_id integer NOT NULL,
    id integer NOT NULL,
    department_id integer,
    type character varying DEFAULT 'user'::character varying NOT NULL
);


--
-- Name: schedule_performer_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.schedule_performer ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.schedule_performer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: scheduled_action_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.scheduled_action_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: scheduled_mail_message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scheduled_mail_message (
    id integer NOT NULL,
    send_to jsonb NOT NULL,
    subject character varying NOT NULL,
    content character varying,
    send_as_html boolean NOT NULL,
    file_ids jsonb NOT NULL,
    sent_at timestamp without time zone,
    mailbox_id integer NOT NULL,
    user_id integer NOT NULL,
    entity_id integer,
    action_id integer,
    account_id integer NOT NULL
);


--
-- Name: scheduled_mail_message_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.scheduled_mail_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shipment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipment (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    warehouse_id integer NOT NULL,
    order_id integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    shipped_at timestamp without time zone,
    status_id integer NOT NULL,
    section_id integer NOT NULL,
    entity_id integer NOT NULL,
    order_number integer NOT NULL
);


--
-- Name: shipment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shipment_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipment_item (
    id integer NOT NULL,
    shipment_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: shipment_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shipment_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: site_form; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_form (
    id integer NOT NULL,
    account_id integer NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    is_active boolean NOT NULL,
    title text,
    responsible_id integer,
    design jsonb,
    field_label_enabled boolean DEFAULT false NOT NULL,
    field_placeholder_enabled boolean DEFAULT true NOT NULL,
    created_by integer NOT NULL
);


--
-- Name: site_form_consent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_form_consent (
    form_id integer NOT NULL,
    account_id integer,
    is_enabled boolean DEFAULT false NOT NULL,
    text text,
    link_url text,
    link_text text,
    default_value boolean DEFAULT false NOT NULL
);


--
-- Name: site_form_entity_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_form_entity_type (
    form_id integer NOT NULL,
    entity_type_id integer NOT NULL,
    account_id integer NOT NULL,
    board_id integer,
    is_main boolean NOT NULL
);


--
-- Name: site_form_field; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_form_field (
    id integer NOT NULL,
    account_id integer NOT NULL,
    page_id integer NOT NULL,
    label text,
    type text NOT NULL,
    is_required boolean,
    sort_order integer NOT NULL,
    placeholder text
);


--
-- Name: site_form_field_entity_field; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_form_field_entity_field (
    form_field_id integer NOT NULL,
    field_id integer NOT NULL,
    entity_type_id integer NOT NULL,
    is_validation_required boolean,
    meta jsonb
);


--
-- Name: site_form_field_entity_name; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_form_field_entity_name (
    form_field_id integer NOT NULL,
    entity_type_id integer NOT NULL
);


--
-- Name: site_form_field_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.site_form_field ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.site_form_field_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: site_form_gratitude; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_form_gratitude (
    form_id integer NOT NULL,
    account_id integer,
    is_enabled boolean DEFAULT false NOT NULL,
    header text,
    text text
);


--
-- Name: site_form_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.site_form ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.site_form_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: site_form_page; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_form_page (
    id integer NOT NULL,
    account_id integer NOT NULL,
    form_id integer NOT NULL,
    title text,
    sort_order integer NOT NULL
);


--
-- Name: site_form_page_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.site_form_page ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.site_form_page_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: stage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stage (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    color character varying(50) NOT NULL,
    code character varying(50),
    is_system boolean NOT NULL,
    sort_order smallint NOT NULL,
    board_id integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: stage_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stage_id_seq
    AS integer
    START WITH 15022001
    INCREMENT BY 1
    MINVALUE 15022001
    NO MAXVALUE
    CACHE 1;


--
-- Name: subtask_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subtask_id_seq
    AS integer
    START WITH 46022001
    INCREMENT BY 1
    MINVALUE 46022001
    NO MAXVALUE
    CACHE 1;


--
-- Name: task_comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_comment (
    id integer NOT NULL,
    text character varying NOT NULL,
    task_id integer NOT NULL,
    created_by integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: task_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.task_comment_id_seq
    AS integer
    START WITH 47022001
    INCREMENT BY 1
    MINVALUE 47022001
    NO MAXVALUE
    CACHE 1;


--
-- Name: task_comment_like; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_comment_like (
    comment_id integer NOT NULL,
    user_id integer NOT NULL,
    account_id integer
);


--
-- Name: task_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_settings (
    id integer NOT NULL,
    active_fields jsonb NOT NULL,
    type character varying(100) NOT NULL,
    record_id integer,
    account_id integer
);


--
-- Name: task_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.task_settings_id_seq
    AS integer
    START WITH 45022001
    INCREMENT BY 1
    MINVALUE 45022001
    NO MAXVALUE
    CACHE 1;


--
-- Name: task_subtask; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_subtask (
    id integer NOT NULL,
    text character varying NOT NULL,
    resolved boolean NOT NULL,
    task_id integer NOT NULL,
    account_id integer NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: test_account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_account (
    account_id integer NOT NULL
);


--
-- Name: trigger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trigger (
    id integer NOT NULL,
    type character varying(100) NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: trigger_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trigger_id_seq
    AS integer
    START WITH 51011001
    INCREMENT BY 1
    MINVALUE 51011001
    NO MAXVALUE
    CACHE 1;


--
-- Name: tutorial_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tutorial_group (
    id integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    name character varying NOT NULL,
    sort_order integer NOT NULL
);


--
-- Name: tutorial_group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tutorial_group ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tutorial_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tutorial_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tutorial_item (
    id integer NOT NULL,
    account_id integer NOT NULL,
    group_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    name character varying NOT NULL,
    link character varying NOT NULL,
    sort_order integer NOT NULL
);


--
-- Name: tutorial_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tutorial_item ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tutorial_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tutorial_item_product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tutorial_item_product (
    id integer NOT NULL,
    account_id integer NOT NULL,
    item_id integer NOT NULL,
    type character varying NOT NULL,
    object_id integer
);


--
-- Name: tutorial_item_product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tutorial_item_product ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tutorial_item_product_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tutorial_item_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tutorial_item_user (
    item_id integer NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: user_condition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_condition (
    condition_id integer NOT NULL,
    user_id integer NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 12022001
    INCREMENT BY 1
    MINVALUE 12022001
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_object_permission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_object_permission (
    user_id integer NOT NULL,
    object_permission_id integer NOT NULL
);


--
-- Name: user_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profile (
    created_at timestamp without time zone NOT NULL,
    user_id integer NOT NULL,
    birth_date timestamp without time zone,
    employment_date timestamp without time zone,
    account_id integer NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(254) NOT NULL,
    password character varying(100) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255),
    phone character varying(32),
    account_id integer NOT NULL,
    role character varying(100) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    department_id integer,
    avatar_id uuid,
    "position" character varying,
    analytics_id uuid NOT NULL
);


--
-- Name: voximplant_account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voximplant_account (
    account_id integer NOT NULL,
    account_name character varying NOT NULL,
    application_id integer NOT NULL,
    application_name character varying NOT NULL,
    external_id integer NOT NULL,
    api_key character varying NOT NULL,
    password character varying NOT NULL,
    billing_account_id integer NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    account_email character varying NOT NULL,
    key_id character varying NOT NULL,
    private_key character varying NOT NULL
);


--
-- Name: voximplant_call; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voximplant_call (
    id integer NOT NULL,
    user_id integer NOT NULL,
    entity_id integer,
    direction character varying NOT NULL,
    phone_number character varying NOT NULL,
    duration integer,
    status character varying,
    failure_reason character varying,
    record_url character varying,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    session_id character varying NOT NULL,
    call_id character varying NOT NULL,
    comment character varying,
    number_id integer
);


--
-- Name: voximplant_call_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.voximplant_call ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.voximplant_call_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: voximplant_number; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voximplant_number (
    id integer NOT NULL,
    account_id integer NOT NULL,
    phone_number character varying NOT NULL,
    external_id character varying
);


--
-- Name: voximplant_number_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.voximplant_number ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.voximplant_number_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: voximplant_number_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voximplant_number_user (
    number_id integer NOT NULL,
    user_id integer NOT NULL,
    account_id integer NOT NULL
);


--
-- Name: voximplant_scenario_entity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voximplant_scenario_entity (
    id integer NOT NULL,
    account_id integer NOT NULL,
    scenario_type character varying NOT NULL,
    contact_id integer,
    deal_id integer,
    board_id integer,
    owner_id integer
);


--
-- Name: voximplant_scenario_entity_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.voximplant_scenario_entity ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.voximplant_scenario_entity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: voximplant_scenario_note; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voximplant_scenario_note (
    id integer NOT NULL,
    account_id integer NOT NULL,
    scenario_type character varying NOT NULL,
    note_text character varying NOT NULL
);


--
-- Name: voximplant_scenario_note_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.voximplant_scenario_note ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.voximplant_scenario_note_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: voximplant_scenario_task; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voximplant_scenario_task (
    id integer NOT NULL,
    account_id integer NOT NULL,
    scenario_type character varying NOT NULL,
    create_activity boolean,
    activity_type_id integer,
    activity_text character varying,
    activity_duration integer,
    activity_owner_id integer,
    create_task boolean,
    task_title character varying,
    task_text character varying,
    task_duration integer,
    task_owner_id integer
);


--
-- Name: voximplant_scenario_task_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.voximplant_scenario_task ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.voximplant_scenario_task_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: voximplant_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voximplant_user (
    user_id integer NOT NULL,
    external_id integer NOT NULL,
    user_name character varying NOT NULL,
    account_id integer NOT NULL,
    password character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: warehouse; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.warehouse (
    id integer NOT NULL,
    name character varying,
    created_by integer NOT NULL,
    account_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    section_id integer NOT NULL
);


--
-- Name: warehouse_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.warehouse_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.account (id, company_name, subdomain, created_at, logo_id) FROM stdin;
\.


--
-- Data for Name: account_api_access; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.account_api_access (account_id, api_key, created_at) FROM stdin;
\.


--
-- Data for Name: account_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.account_settings (account_id, language, working_days, working_time_from, working_time_to, time_zone, currency, number_format, phone_format, allow_duplicates) FROM stdin;
\.


--
-- Data for Name: account_subscription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.account_subscription (account_id, created_at, expired_at, is_trial, user_limit, plan_name, external_customer_id) FROM stdin;
\.


--
-- Data for Name: action; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.action (id, type, delay, account_id) FROM stdin;
\.


--
-- Data for Name: action_activity_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.action_activity_settings (action_id, responsible_user_type, responsible_user_id, activity_type_id, text, deadline_type, deadline_time, account_id) FROM stdin;
\.


--
-- Data for Name: action_email_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.action_email_settings (action_id, subject, content, send_as_html, mailbox_id, user_id, account_id, signature) FROM stdin;
\.


--
-- Data for Name: action_entity_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.action_entity_settings (action_id, stage_id, account_id, operation_type) FROM stdin;
\.


--
-- Data for Name: action_scheduled; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.action_scheduled (id, action_id, entity_id, scheduled_time, completed, account_id, created_by) FROM stdin;
\.


--
-- Data for Name: action_task_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.action_task_settings (action_id, responsible_user_type, responsible_user_id, title, text, deadline_type, deadline_time, account_id) FROM stdin;
\.


--
-- Data for Name: activity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity (id, created_at, account_id, created_by, responsible_user_id, text, start_date, end_date, is_resolved, result, activity_type_id, entity_id, resolved_date, weight) FROM stdin;
\.


--
-- Data for Name: activity_type; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_type (id, created_at, account_id, name, is_active) FROM stdin;
\.


--
-- Data for Name: appsumo_license; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appsumo_license (id, license_key, license_status, plan_id, tier, account_id, created_at, prev_license_key) FROM stdin;
\.


--
-- Data for Name: appsumo_tier; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appsumo_tier (id, tier, user_limit, term_in_days, plan_name) FROM stdin;
1	1	1	36500	AppSumo Tier 1
2	2	5	36500	AppSumo Tier 2
3	3	15	36500	AppSumo Tier 3
4	4	30	36500	AppSumo Tier 4
5	5	50	36500	AppSumo Tier 5
\.


--
-- Data for Name: automation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.automation (id, trigger_id, action_id, created_by, is_active, account_id, created_at) FROM stdin;
\.


--
-- Data for Name: automation_condition; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.automation_condition (automation_id, condition_id, account_id) FROM stdin;
\.


--
-- Data for Name: automation_entity_type; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.automation_entity_type (id, account_id, created_at, created_by, name, triggers, entity_type_id, board_id, stage_id, conditions, actions, process_id) FROM stdin;
\.


--
-- Data for Name: automation_process; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.automation_process (id, account_id, created_at, resource_key, bpmn_file, bpmn_process_id) FROM stdin;
\.


--
-- Data for Name: automation_stage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.automation_stage (automation_id, stage_id) FROM stdin;
\.


--
-- Data for Name: board; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.board (id, name, type, record_id, account_id, created_at, sort_order, is_system, code, need_migration, task_board_id, owner_id, participant_ids) FROM stdin;
\.


--
-- Data for Name: chat; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat (id, provider_id, created_by, external_id, type, title, entity_id, account_id, created_at) FROM stdin;
\.


--
-- Data for Name: chat_message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_message (id, chat_id, chat_user_id, external_id, text, account_id, created_at, reply_to_id) FROM stdin;
\.


--
-- Data for Name: chat_message_file; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_message_file (id, message_id, external_id, account_id, file_id, name, mime_type, size, created_at) FROM stdin;
\.


--
-- Data for Name: chat_message_reaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_message_reaction (id, message_id, chat_user_id, reaction, account_id, created_at) FROM stdin;
\.


--
-- Data for Name: chat_message_user_status; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_message_user_status (chat_id, message_id, chat_user_id, status, account_id, created_at) FROM stdin;
\.


--
-- Data for Name: chat_pinned_message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_pinned_message (chat_id, message_id, created_at, account_id) FROM stdin;
\.


--
-- Data for Name: chat_provider; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_provider (id, created_by, type, title, account_id, created_at, status, transport) FROM stdin;
\.


--
-- Data for Name: chat_provider_messenger; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_provider_messenger (provider_id, page_id, page_access_token, account_id, user_id, user_access_token) FROM stdin;
\.


--
-- Data for Name: chat_provider_twilio; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_provider_twilio (provider_id, account_sid, auth_token, phone_number, account_id) FROM stdin;
\.


--
-- Data for Name: chat_provider_user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_provider_user (provider_id, user_id, account_id, type) FROM stdin;
\.


--
-- Data for Name: chat_provider_wazzup; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_provider_wazzup (provider_id, account_id, api_key, channel_id, plain_id, transport) FROM stdin;
\.


--
-- Data for Name: chat_user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_user (id, chat_id, user_id, role, account_id) FROM stdin;
\.


--
-- Data for Name: chat_user_external; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_user_external (account_id, external_id, first_name, last_name, avatar_url, phone, email, link, chat_user_id) FROM stdin;
\.


--
-- Data for Name: condition; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.condition (id, type, account_id) FROM stdin;
\.


--
-- Data for Name: demo_data; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.demo_data (id, account_id, type, ids) FROM stdin;
\.


--
-- Data for Name: department; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.department (id, name, parent_id, account_id) FROM stdin;
\.


--
-- Data for Name: document_template; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.document_template (id, name, created_by, account_id, created_at, created_count) FROM stdin;
\.


--
-- Data for Name: document_template_access; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.document_template_access (document_template_id, user_id, account_id) FROM stdin;
\.


--
-- Data for Name: document_template_entity_type; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.document_template_entity_type (document_template_id, entity_type_id, account_id) FROM stdin;
\.


--
-- Data for Name: entity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entity (id, name, entity_type_id, responsible_user_id, stage_id, created_by, account_id, created_at, participant_ids, weight, closed_at, copied_from, copied_count) FROM stdin;
\.


--
-- Data for Name: entity_event; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entity_event (id, account_id, entity_id, object_id, type, created_at) FROM stdin;
\.


--
-- Data for Name: entity_link; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entity_link (id, source_id, target_id, sort_order, back_link_id, account_id) FROM stdin;
\.


--
-- Data for Name: entity_list_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entity_list_settings (id, entity_type_id, board_id, settings, account_id, created_at) FROM stdin;
\.


--
-- Data for Name: entity_stage_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entity_stage_history (id, account_id, entity_id, board_id, stage_id, created_at) FROM stdin;
\.


--
-- Data for Name: entity_type; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entity_type (id, name, entity_category, section_name, section_view, section_icon, account_id, created_at, sort_order) FROM stdin;
\.


--
-- Data for Name: entity_type_feature; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entity_type_feature (entity_type_id, feature_id, account_id) FROM stdin;
\.


--
-- Data for Name: entity_type_link; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entity_type_link (id, source_id, target_id, sort_order, account_id) FROM stdin;
\.


--
-- Data for Name: exact_time_trigger_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.exact_time_trigger_settings (trigger_id, date, account_id) FROM stdin;
\.


--
-- Data for Name: external_entity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.external_entity (id, entity_id, url, account_id, created_at, system, raw_data, ui_data) FROM stdin;
\.


--
-- Data for Name: external_system; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.external_system (id, name, code, url_templates) FROM stdin;
1	SalesForce	salesforce	{salesforce.com,force.com}
2	LinkedIn	linkedin	{linkedin.com}
3	Facebook	facebook	{facebook.com,fb.com}
4	Pipedrive	pipedrive	{pipedrive.com}
5	HubSpot	hubspot	{hubspot.com}
6	Freshsales	freshsales	{freshworks.com,myfreshworks.com}
7	Zoho	zoho	{zoho.com}
8	Twitter	twitter	{twitter.com}
9	Instagram	instagram	{instagram.com}
10	Notion	notion	{notion.so}
11	Zendesk	zendesk	{zendesk.com}
12	SugarCRM	sugarcrm	{sugarcrm.com}
13	Monday	monday	{monday.com}
14	amoCRM	amocrm	{amocrm.ru,kommo.com}
15	Bitrix24	bitrix	{bitrix24.ru,bitrix24.com,bitrix24.es,bitrix24.eu,bitrix24.de,bitrix24.fr,bitrix24.pl,bitrix24.it,bitrix24.uk}
\.


--
-- Data for Name: feature; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.feature (id, name, code, is_enabled) FROM stdin;
1	Activities	activities	t
2	Tasks	tasks	t
6	File storage disk	diskForFiles	f
7	Avatar	avatar	f
8	Photo/pictures (several)	photos	f
3	Notes	notes	t
5	File storage	saveFiles	t
4	Chat	chat	t
9	Create Documents	documents	t
10	Products	products	f
\.


--
-- Data for Name: field; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.field (id, name, type, sort_order, entity_type_id, field_group_id, account_id, created_at, code, active, value) FROM stdin;
\.


--
-- Data for Name: field_condition; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.field_condition (condition_id, field_id, field_type, payload, account_id) FROM stdin;
\.


--
-- Data for Name: field_group; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.field_group (id, name, sort_order, entity_type_id, account_id, created_at) FROM stdin;
\.


--
-- Data for Name: field_option; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.field_option (id, label, sort_order, field_id, account_id, created_at, color) FROM stdin;
\.


--
-- Data for Name: field_stage_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.field_stage_settings (id, account_id, field_id, stage_id, access, exclude_user_ids) FROM stdin;
\.


--
-- Data for Name: field_user_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.field_user_settings (id, account_id, field_id, user_id, access) FROM stdin;
\.


--
-- Data for Name: field_value; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.field_value (id, field_id, payload, entity_id, account_id, field_type) FROM stdin;
\.


--
-- Data for Name: file_info; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.file_info (id, account_id, created_at, created_by, original_name, mime_type, size, store_path, is_used, hash_sha256) FROM stdin;
\.


--
-- Data for Name: file_link; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.file_link (id, account_id, source_type, source_id, file_id, file_name, file_size, file_type, created_at, created_by) FROM stdin;
\.


--
-- Data for Name: industry; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.industry (code, name, color, sort_order, active) FROM stdin;
it_and_development	IT & Development	#FF8D07	0	t
construction_and_engineering	Construction and engineering	#A33CAB	1	t
advertising_and_marketing	Advertising & Marketing	#67E2F9	2	t
consulting_and_outsourcing	Consulting and outsourcing	#8AF039	3	t
manufacturing	Manufacturing	#EC008C	4	t
education	Education	#3D8FEC	5	t
\.


--
-- Data for Name: mail_message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mail_message (id, mailbox_id, external_id, thread_id, snippet, sent_from, sent_to, subject, date, account_id, reply_to, cc, has_attachment, message_id, references_to, in_reply_to, entity_id, is_seen) FROM stdin;
\.


--
-- Data for Name: mail_message_folder; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mail_message_folder (message_id, folder_id) FROM stdin;
\.


--
-- Data for Name: mail_message_payload; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mail_message_payload (id, message_id, mime_type, filename, attachment, content, account_id, sort_order, size, external_id) FROM stdin;
\.


--
-- Data for Name: mailbox; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mailbox (id, account_id, created_at, email, provider, owner_id, create_contact, state, contact_entity_type_id, lead_entity_type_id, lead_board_id, error_message, emails_per_day, create_lead) FROM stdin;
\.


--
-- Data for Name: mailbox_accessible_user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mailbox_accessible_user (mailbox_id, user_id, account_id) FROM stdin;
\.


--
-- Data for Name: mailbox_folder; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mailbox_folder (id, mailbox_id, external_id, name, type, account_id, messages_total, messages_unread) FROM stdin;
\.


--
-- Data for Name: mailbox_settings_gmail; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mailbox_settings_gmail (mailbox_id, account_id, tokens, history_id) FROM stdin;
\.


--
-- Data for Name: mailbox_settings_manual; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mailbox_settings_manual (mailbox_id, account_id, password, imap_server, imap_port, imap_secure, smtp_server, smtp_port, smtp_secure, imap_sync) FROM stdin;
\.


--
-- Data for Name: mailbox_signature; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mailbox_signature (id, account_id, created_at, name, text, created_by) FROM stdin;
\.


--
-- Data for Name: mailbox_signature_link; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mailbox_signature_link (account_id, signature_id, mailbox_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1667672722508	AddAccount1667672722508
2	1667743637921	AddUser1667743637921
3	1667755763616	AddUserAccount1667755763616
4	1668609239887	AddEntityType1668609239887
5	1668679480636	AddBoard1668679480636
6	1668679994594	Note1668679994594
7	1668680006964	AddStage1668680006964
8	1668693976313	FeedsView1668693976313
9	1668759141152	AddEntity1668759141152
10	1668769413399	AddFeedItemsSequence1668769413399
11	1668770161278	AddTaskType1668770161278
12	1668957885188	AddSortOrderToBoard1668957885188
13	1669035936818	AddActivity1669035936818
14	1669035943607	AddTask1669035943607
15	1669126197933	AddFieldGroup1669126197933
16	1669127718002	AddField1669127718002
17	1669130700529	AddTaskToFeed1669130700529
18	1669192730867	AddNoteToEntityFK1669192730867
19	1669197308978	AddFieldOption1669197308978
20	1669210346088	AddTasksView1669210346088
21	1669279080953	FixActivityConstraints1669279080953
22	1669370353662	SplitUserName1669370353662
23	1669372200327	AddUserPhone1669372200327
24	1669535731810	UserProfile1669535731810
25	1669545773479	EntityTypeLink1669545773479
26	1669565827895	EntityLink1669565827895
27	1669629567395	RemoveUserAccount1669629567395
28	1669706986248	AddFeature1669706986248
29	1669707814502	AddEntityTypeToFeature1669707814502
30	1669711256398	AddDefaultFeatures1669711256398
31	1669732421801	AddFieldValue1669732421801
32	1669799906268	FixEntityLinkColumns1669799906268
33	1669880194355	ChangeFeatureNameNotes1669880194355
34	1669966161211	BigintToInteger1669966161211
35	1669973222725	ForeignKeyToInteger1669973222725
36	1669991106433	AddFieldTypeColumnToFieldValue1669991106433
37	1670576080218	AddExternalEntity1670576080218
38	1670840721696	ExternalSystem1670840721696
39	1670846440118	AddExternalSystems1670846440118
40	1670936878487	AddFileInfo1670936878487
41	1670939571185	AddFileStorePath1670939571185
42	1671006792499	AddStageIdToTask1671006792499
43	1671030345135	ChangeFileInfoIdType1671030345135
44	1671089754889	AddEntityTypeSortOrder1671089754889
45	1671096971264	RenameTaskType1671096971264
46	1671108685879	NoteFiles1671108685879
47	1671196063822	FileInfoCascade1671196063822
48	1671196394406	NoteFileRemoveFileKey1671196394406
49	1671203263368	TaskAndActivityFiles1671203263368
50	1671438176416	RemoveKeyFromFileInfo1671438176416
51	1671439005617	AddIsUsedToFileInfo1671439005617
52	1671440838639	DropNoteFileLink1671440838639
53	1671521628139	BoardRecordIdNull1671521628139
54	1671533557027	UserActive1671533557027
55	1671619787598	UserObjectPermission1671619787598
56	1671914250074	ChangeCardView1671914250074
57	1672064100473	EntityIdCascade1672064100473
58	1672154773200	AddSalesforceSettings1672154773200
59	1672224404851	AddRefreshTokenToSalesforce1672224404851
60	1672242451242	ExternalSystemUrlTemplates1672242451242
61	1672306523845	AddDataToExternalEntity1672306523845
62	1672386954959	AddUIDataToExternalEntity1672386954959
63	1672928537580	CascadeStageIdInTask1672928537580
64	1673251726994	AddStageToAllTasks1673251726994
65	1673339773307	EnableFileStorageFeature1673339773307
66	1673417366210	RenameCardViewToEntityCategory1673417366210
67	1673447442894	AddSubscription1673447442894
68	1673514341599	AddCreatedAtToFileLink1673514341599
69	1673515827427	AddSequenceToSubscriptionId1673515827427
70	1673969196807	AddMailboxAndProviderSettings1673969196807
71	1674130775550	AddMailboxState1674130775550
72	1674138959333	AddPlannedTimeToTask1674138959333
73	1674203801914	ChangeMailboxSettingsGmail1674203801914
74	1674492197867	AddHistoryIdToGmailSettings1674492197867
75	1674546589359	AddLastSyncToManualSettings1674546589359
76	1674560582007	AddMailMessageBase1674560582007
77	1674572622632	AddTaskSettings1674572622632
78	1674637903317	ChangeMailbox1674637903317
79	1674638261068	AddMailboxAccessibleUser1674638261068
80	1674648741806	AddMailboxFolderInfo1674648741806
81	1674660419230	AddMailMessageReplyTo1674660419230
82	1674661928759	AddMailMessageCc1674661928759
83	1674732906697	AddMailMessagePayloadSortOrder1674732906697
84	1674741639286	MakeStartEndDateNullable1674741639286
85	1674742927551	AddSubtaskTable1674742927551
86	1674747324757	AddMailMessagePayloadSize1674747324757
87	1674822646459	AddTaskCommentTable1674822646459
88	1674823506430	DeleteSyncDaysFromMailbox1674823506430
89	1674831146207	AddTaskCommentLikeTable1674831146207
90	1675076470234	ImapSync1675076470234
91	1675080091774	AddSystemColumnToBoard1675080091774
92	1675086921624	AddMailMessagePayloadExternalId1675086921624
93	1675090441216	AddTaskSettingsIdToTask1675090441216
94	1675176424905	AddMailMessageHasAttachment1675176424905
95	1675178566416	MailboxFolderTypeNullable1675178566416
96	1675259924922	AddMailMessageMessageId1675259924922
97	1675340097111	DropGroupMessageFromMailbox1675340097111
98	1675349215128	AddCodeColumn1675349215128
99	1675350490867	AddCodeToBoard1675350490867
100	1675412897506	AddMailMessageReferences1675412897506
101	1675858313415	AddContactEntityTypeToMailbox1675858313415
102	1675858907059	AddLeadEntityTypeToMailbox1675858907059
103	1675932022996	AddLeadBoardIdToMailbox1675932022996
104	1675933206380	AddContactIdToMailMessage1675933206380
105	1675939938059	MailMessageThreadIdNotNull1675939938059
106	1675949522751	AddErrorToMailbox1675949522751
107	1675958088984	AddSeenToMailMessage1675958088984
108	1676281117335	AddSetNullOnDeleteToMailbox1676281117335
109	1676283110539	AlterMailMessageSentToNull1676283110539
110	1676299431922	AddRecipientToNote1676299431922
111	1676370561831	AddMailToFeedItem1676370561831
112	1676383947580	TurnOnChatFeature1676383947580
113	1676385805343	AddChatFeedItemType1676385805343
114	1676823429937	AddAutomationTables1676823429937
115	1676866745580	AddAutomationStageTable1676866745580
116	1676872004900	AddTaskActionSettingsTable1676872004900
117	1676884562402	RemoveResultFromTask1676884562402
118	1676895093533	AddChangeStageActionSettingsTable1676895093533
119	1676992655279	AddAutomationConditions1676992655279
120	1676994397217	AddNotification1676994397217
121	1677079993131	AddUserIdToNotification1677079993131
122	1677581691766	AddMailboxSignature1677581691766
123	1677744619246	AddNotificationHighlight1677744619246
124	1677752600091	AlterNotificationSetDescriptionNullable1677752600091
125	1677765215861	AddNotificationSettings1677765215861
126	1678093755605	AddExternalSystems1678093755605
127	1678096716231	AddAccountSettings1678096716231
128	1678113775031	AddExactTimeTriggerSettings1678113775031
129	1678194605837	AddDefaultNotificationSettings1678194605837
130	1678285724304	AddResolveDateToTaskAndActivity1678285724304
131	1678286876322	AddResolveDateToAllTasks1678286876322
132	1678347902775	AlterNotificationHighlightToTagName1678347902775
133	1678367411991	FillResolvedDateForTaskAndAction1678367411991
134	1678696011650	AddPlanNameToSubscription1678696011650
135	1678697720944	UpdateSubscriptionTo50Users1678697720944
136	1678720323399	AddCodeToField1678720323399
137	1678891987277	AddDepartment1678891987277
138	1678963689149	AddStartsInToNotification1678963689149
139	1679291439089	AddScheduledAction1679291439089
140	1679494426598	MakeFieldGroupOptional1679494426598
141	1679578329175	AddColorToFieldOption1679578329175
142	1679583365997	AlterMailMessageContactEntityId1679583365997
143	1679929245833	AddUserAvatarId1679929245833
144	1679931642588	AddActiveToField1679931642588
145	1679931904542	AddAccountLogo1679931904542
146	1680499051021	AddParticipantsToEntity1680499051021
147	1680763220747	MigrateProjects1680763220747
148	1681141545739	AddEmailActionSettings1681141545739
149	1681224301468	AddProjectFields1681224301468
150	1681289039535	AddEntityListSettings1681289039535
151	1681483040117	AddScheduledMailMessage1681483040117
152	1681732037710	AddEmailsPerDayColumnToMailbox1681732037710
153	1681828967422	AddWeightToTaskAndActivity1681828967422
154	1681832187113	AddWeightToAllTasks1681832187113
155	1681900142878	ResetWeightForTasksAndActivities1681900142878
156	1682002593036	AddEntityWeight1682002593036
157	1682083589639	AddAccountIdTETFeature1682083589639
158	1682348048312	AddRMS1682348048312
159	1682350735553	AddIndustries1682350735553
160	1682433824946	AddDemoMarker1682433824946
161	1682507153940	AddDocumentTemplate1682507153940
162	1682518277268	DeleteFileInfoWithUser1682518277268
163	1682589692981	AddIndexes1682589692981
164	1683016482581	AddIndexes1683016482581
165	1683205194466	AddTaskBoardIdToBoard1683205194466
166	1683517583707	DeleteProjectEntityBoards1683517583707
167	1683731671898	AddFeatureDocuments1683731671898
168	1683797890507	AddDocumentTemplateGenerated1683797890507
169	1683802969000	AddDocumentInFeed1683802969000
170	1683875863921	TrimUsersNames1683875863921
171	1684249775346	AddAllTasksStageId1684249775346
172	1684317847183	addCreatedByToFileLink1684317847183
173	1685001497108	ChangeFileInfoHash1685001497108
174	1685595302584	AddParticipantsToBoard1685595302584
175	1685604837960	AddChatModel1685604837960
176	1685689401123	AddDefaultChatProvider1685689401123
177	1686048795624	AddBoardIdToTask1686048795624
178	1686061937533	AlterChatMEssageFile1686061937533
179	1686297344564	AlterMailMessageEntityId1686297344564
180	1686310775887	AddSignatureToEmailActionSettings1686310775887
181	1686643536303	AddReplayToInChatMessage1686643536303
182	1686736715335	AddChatPinnedMessage1686736715335
183	1686816157824	AddChatPinnedMessage1686816157824
184	1686824143539	AddChatMessageReaction1686824143539
185	1686840724427	AddProducts1686840724427
186	1686904432256	AddChatIdToStatus1686904432256
187	1686930758334	RenameProductField1686930758334
188	1687015795997	AlterChatMessageReply1687015795997
189	1687350416742	RemoveIdFromSubscription1687350416742
190	1687351857599	AddSubscriptionExternalCustomerId1687351857599
191	1687790975332	AddOrder1687790975332
192	1687793191931	FixOrder1687793191931
193	1687877020115	AddTaxIncluded1687877020115
194	1687943824933	AddChatProviderTwilio1687943824933
195	1687954149882	AlterChatProviderUser1687954149882
196	1687962117509	AddWarehouse1687962117509
197	1687965328992	AddIsDeletedToWarehouse1687965328992
198	1688025794222	AlterChatUser1688025794222
199	1688044274695	AddStocks1688044274695
200	1688053486248	AddChatUserExternalName1688053486248
201	1688112039219	AlterChatProviderTwilio1688112039219
202	1688130606571	AlterChatProviderUser1688130606571
203	1688136613049	AlterChat1688136613049
204	1688138872050	AddOrderStatus1688138872050
205	1688139271540	AddShipment1688139271540
206	1688140521166	AddStatusIdToOrder1688140521166
207	1688388514670	AddReservation1688388514670
208	1688390259595	AlterFileInfoCreatedBy1688390259595
209	1688394200229	FixStatusIdInOrder1688394200229
210	1688472386401	AddShipmentDate1688472386401
211	1688543908016	AddChatProviderMessenger1688543908016
212	1688567846856	AlterChatUser1688567846856
213	1688996628275	FixCategoryIdConstraint1688996628275
214	1689059395581	AddChatProviderStatus1689059395581
215	1689068374394	AddUserIdToMessengerProvider1689068374394
216	1689081064483	AddWarehouseIdToOrder1689081064483
217	1689087134759	AddModules1689087134759
218	1689170448447	AddProductType1689170448447
219	1689243925753	FixOrderStatuses1689243925753
220	1689259268310	DeleteShipmentStatus1689259268310
221	1689337185167	AddProductsFeature1689337185167
222	1689508562776	AddIsActiveToReservation1689508562776
223	1689763128902	RemoveNoteRecipientId1689763128902
224	1689774963182	AddUpdatedAtToProduct1689774963182
225	1689860682052	AddSchedule1689860682052
226	1689933154489	AlterSchedulePerformer1689933154489
227	1690208012261	AddProductModule1690208012261
228	1690456178510	MigrateModuleToProductModule1690456178510
229	1690467527775	RemoveModule1690467527775
230	1690469860109	AddProductPermissions1690469860109
231	1690543599386	DropProductPermissions1690543599386
232	1690817128717	AlterProductModule1690817128717
233	1690973831680	AddSectionIdToProducts1690973831680
234	1691056504886	AddSectionIdToOrderAndShipment1691056504886
235	1691061102493	DeleteShipmentStatus1691061102493
236	1691061408646	AlterTableStockToProductStock1691061408646
237	1691139996885	AddProductsSectionEntityType1691139996885
238	1691155049107	AddRentalInterval1691155049107
239	1691397636905	AlterProductsSectionType1691397636905
240	1691411118591	AddRentalOrder1691411118591
241	1691414938591	AddRentalSchedule1691414938591
242	1691657890280	AddRentalOrderPeriod1691657890280
243	1691678125349	AddRentalOrderPeriodAccountId1691678125349
244	1691754596482	AlterRentalOrder1691754596482
245	1691755141714	AlterRentalOrderItem1691755141714
246	1692002092660	RentalScheduleAddSectionId1692002092660
247	1692014115943	RenameRentalScheduleToRentalEvent1692014115943
248	1692170842159	AddProductsSectionEnableWarehouse1692170842159
249	1692172254434	AddOrdersOrderNumber1692172254434
250	1692172318353	AddRentalOrderOrderNumber1692172318353
251	1692283603851	AlterOrderItemCascadeDelete1692283603851
252	1692343747646	AlterProductStock1692343747646
253	1692354371998	FixFieldValueType1692354371998
254	1692604044210	ProductsSectionEnableBarcode1692604044210
255	1692708295281	AlterOrderStatusNull1692708295281
256	1692885285551	RefactorScheduler1692885285551
257	1692890628636	RenameScheduleEvent1692890628636
258	1692975377102	AlterSchedule1692975377102
259	1693218884137	UserPosition1693218884137
260	1693232990040	ScheduleAppointmentOrderId1693232990040
261	1693485238189	OrderStatusColor1693485238189
262	1693556962547	CascadeDeleteShipment1693556962547
263	1694085886365	SchedulerIcon1694085886365
264	1694166234404	BoardCleanProjectParticipants1694166234404
265	1695040324876	AppointmentTitle1695040324876
266	1695046445852	EntityClosedAt1695046445852
267	1695201739381	SalesPlan1695201739381
268	1695287859742	ChatDeleteCascadeEntity1695287859742
269	1695382850916	SalesPlanAlterAmount1695382850916
270	1695742049917	VoximplantUser1695742049917
271	1695743140564	VoximplantUserPrimaryColumn1695743140564
272	1695808984339	VoximplantUserPassword1695808984339
273	1695810676148	VoximplantAccount1695810676148
274	1695820387969	AlterVoximplantUser1695820387969
275	1696500815450	DemoData1696500815450
276	1697019761609	VoximplantCall1697019761609
277	1697028866185	AlterVoximplantUser1697028866185
278	1697115016543	RefactorDemoData1697115016543
279	1697440579544	SchedulerEventPerformerCascade1697440579544
280	1697452411558	VoximplantUserActive1697452411558
281	1697541300418	VoximplantAccount1697541300418
282	1697541767120	VoximplantAccountAlter1697541767120
283	1697543064652	VoximplantAccountEmail1697543064652
284	1697556130148	VoximplantAccountKey1697556130148
285	1697702819805	VoximplantCallAlterExternalId1697702819805
286	1698135013349	ReportingOptimization1698135013349
287	1698421539770	VoximplantScenarios1698421539770
288	1698663785490	OrderStatusColors1698663785490
289	1699457673085	AddEntityEventModel1699457673085
290	1700060543771	AddSchedulePerformerId1700060543771
291	1700060859571	AlterSchedulePerformer1700060859571
292	1700230572219	AlterMailbox1700230572219
293	1700395051542	AlterExternalEntity1700395051542
294	1700475817946	AllEventsMigrationScript1700475817946
295	1700591906266	TelephonyCallsToEntityEvent1700591906266
296	1700663233866	AlterSchedulerAppointment1700663233866
297	1700729760783	AlterSchedule1700729760783
298	1700733045104	AlterSchedule1700733045104
299	1700735236205	AlterSchedule1700735236205
300	1700741072037	ProductOrdersToEntityEvents1700741072037
301	1700820935837	AlterSchedulerAppointment1700820935837
302	1700836699189	ShipmentsToEntityEvents1700836699189
303	1701264274255	CallsToEntityEventsFix1701264274255
304	1701437712747	DeleteEntityEventTelephonyCalls1701437712747
305	1701701891843	AlterVoximplantCall1701701891843
306	1702542289418	UpdateModulesIcons1702542289418
307	1702637665853	AlterActivityType1702637665853
308	1702970939958	AlterAccountSettings1702970939958
309	1703085253100	AlterProductPrice1703085253100
310	1703488850551	AlterAccountSettings1703488850551
311	1703502036545	FieldSettings1703502036545
312	1703761495779	AlterFieldStageSettings1703761495779
313	1703850851646	AlterShipment1703850851646
314	1703857140848	AlterReservation1703857140848
315	1703876929122	AlterChangeStageActionSettings1703876929122
316	1704282894747	AlterEntity1704282894747
317	1706795467082	TestAccount1706795467082
318	1708088397272	EntityStageChange1708088397272
319	1708433846254	EntityChangeHistoryInit1708433846254
320	1708589222946	UserAnalyticsId1708589222946
321	1708952321460	OptimizeNotificationIndexes1708952321460
322	1709047301377	DBOptimizationIndex1709047301377
323	1709048922111	StageAccountIdIndex1709048922111
324	1709110989045	ScheduledMailMessageIndex1709110989045
325	1709111575857	AddIndexes1709111575857
326	1709280253891	ChatProviderCascadeDelete1709280253891
327	1709736232826	ChatEntityRemoveCascade1709736232826
328	1709805560320	ChatUserExternal1709805560320
329	1710162901881	EntityCopiedCount1710162901881
330	1710758264055	OrderCancelAfter1710758264055
331	1710759144910	ProductSectionCancelAfter1710759144910
332	1710864090375	ScheduledActionCreatedBy1710864090375
333	1710927112868	TutorialGroup1710927112868
334	1710929893275	TutorialItem1710929893275
335	1710939538331	TutorialItemUser1710939538331
336	1711033243401	TutorialItemProduct1711033243401
337	1711087326245	MailMessageIndexes1711087326245
338	1711540999340	EntityActionSettings1711540999340
339	1711541635402	ActionSettingsRename1711541635402
340	1711706670268	ScheduledAction1711706670268
341	1711962655915	AutomationActionSettings1711962655915
342	1712575547663	FieldValue1712575547663
343	1713167989297	DeleteAllFormulaFields1713167989297
344	1713257835467	FixEntityTypeSortOrder1713257835467
345	1713258622876	FixEntityTypeLinkSortOrder1713258622876
346	1713971186799	ChatProviderTransport1713971186799
347	1714382561376	WazzupProvider1714382561376
348	1714557065128	ProductPricePrecision1714557065128
349	1714663341741	WazzupProviderRemoveChatType1714663341741
350	1714730508391	WazzupProviderTransport1714730508391
351	1714732587962	RemoveWazzupProviders1714732587962
352	1714734600334	ChatProviderTypeRename1714734600334
353	1715602468891	ChatProviderUserType1715602468891
354	1715610371002	AlterChatUserExternal1715610371002
355	1715856544173	AccountApiAccess1715856544173
356	1715856948928	AlterAccountApiAccess1715856948928
357	1716299180820	VoximplantNumber1716299180820
358	1716384743872	VoximplantPhoneNumber1716384743872
359	1716465152984	VoximplantNumberDefaults1716465152984
360	1716466922606	VoximplantCallNumber1716466922606
361	1716469802549	VoximplantCallNumberDefault1716469802549
362	1717599382958	AddForms1717599382958
363	1717746424353	SiteFormPageSortOrder1717746424353
364	1717773341006	FormSiteLink1717773341006
365	1718030543491	SiteFormEntityType1718030543491
366	1718098299378	SiteFormRemoveConsent1718098299378
367	1718098642901	SiteFormConsent1718098642901
368	1718115282972	SiteFormGratitude1718115282972
369	1718118622975	AlterSiteForm1718118622975
370	1718120948980	AlterSiteFormField1718120948980
371	1718266194827	NotificationRemoveTag1718266194827
372	1718613418648	AlterSiteForm1718613418648
373	1718715571983	AlterSiteFormField1718715571983
374	1718724129043	AutomationProcess1718724129043
375	1718793150525	AlterSiteFormField1718793150525
376	1718793757895	AlterSiteFormField1718793757895
377	1718798058177	AlterAutomationProcess1718798058177
378	1718801950089	AlterAutomationProcess1718801950089
379	1718880290844	AlterSiteFormField1718880290844
380	1719213418299	AlterSiteFormField1719213418299
381	1719302707526	AlterSiteFormField1719302707526
382	1719324782700	RenameSubtask1719324782700
383	1719325474889	AlterTaskSubtaskSortOrder1719325474889
384	1719393706903	AlterAutomationProcess1719393706903
385	1719396909800	AutomationEntityType1719396909800
386	1719404585119	AlterAutomationEntityType1719404585119
387	1719411072571	AlterAutomationEntityType1719411072571
388	1719414260257	AlterAutomationEntityType1719414260257
389	1719502764234	AlterAutomationEntityType1719502764234
390	1719502897605	AlterAutomationEntityType1719502897605
391	1719833217147	AlterEntityType1719833217147
392	1719995612500	UpdateCopiesCreatedAt1719995612500
393	1720076313493	AlterSiteForm1720076313493
394	1720077438733	AlterSiteFormEntityType1720077438733
395	1720194016236	AppSumoLicense1720194016236
396	1720194705296	AppSumoPreset1720194705296
397	1720423072348	AppSumoPresets1720423072348
398	1720423711324	RenameAppSumo1720423711324
399	1720434041376	AppsumoLicenseUnique1720434041376
400	1720446828855	AlterReadyMadeSolution1720446828855
401	1720530507278	RenameAppsumoPreset1720530507278
402	1720530714621	AlterAppsumoTier1720530714621
403	1720531175011	RenameSubscription1720531175011
404	1720596831169	AlterAppsumoTier1720596831169
405	1720597683965	UpdateAccountSubscription1720597683965
406	1720610809785	AlterAppsumoLicense1720610809785
407	1720619947686	AlterAppsumoTier1720619947686
408	1720778334472	AlterAutomationEntityType1720778334472
\.


--
-- Data for Name: note; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.note (id, created_at, text, entity_id, created_by, account_id) FROM stdin;
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification (id, account_id, created_at, type, object_id, entity_id, from_user, title, description, is_seen, user_id, starts_in) FROM stdin;
\.


--
-- Data for Name: notification_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_settings (id, account_id, user_id, enable_popup) FROM stdin;
\.


--
-- Data for Name: notification_type_follow_user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_type_follow_user (type_id, user_id, account_id) FROM stdin;
\.


--
-- Data for Name: notification_type_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_type_settings (id, account_id, settings_id, type, is_enabled, object_id, before) FROM stdin;
\.


--
-- Data for Name: object_permission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.object_permission (id, account_id, created_at, object_type, object_id, create_permission, view_permission, edit_permission, delete_permission) FROM stdin;
\.


--
-- Data for Name: order_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_item (id, unit_price, quantity, tax, discount, product_id, order_id, sort_order, account_id) FROM stdin;
\.


--
-- Data for Name: order_status; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_status (id, name, color, code, sort_order, account_id) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, total_amount, currency, entity_id, created_by, account_id, created_at, tax_included, status_id, warehouse_id, section_id, order_number, updated_at, cancel_after) FROM stdin;
\.


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product (id, name, description, sku, unit, tax, is_deleted, category_id, created_by, account_id, created_at, type, updated_at, section_id) FROM stdin;
\.


--
-- Data for Name: product_category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_category (id, name, parent_id, created_by, account_id, created_at, section_id) FROM stdin;
\.


--
-- Data for Name: product_price; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_price (id, name, unit_price, currency, product_id, account_id, max_discount) FROM stdin;
\.


--
-- Data for Name: product_stock; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_stock (product_id, warehouse_id, stock_quantity, account_id) FROM stdin;
\.


--
-- Data for Name: products_section; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products_section (id, name, icon, account_id, created_at, type, enable_warehouse, enable_barcode, cancel_after) FROM stdin;
\.


--
-- Data for Name: products_section_entity_type; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products_section_entity_type (section_id, entity_type_id, account_id) FROM stdin;
\.


--
-- Data for Name: ready_made_solution; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ready_made_solution (code, name, subdomain, sort_order, active, industry_code, account_id) FROM stdin;
\.


--
-- Data for Name: rental_event; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rental_event (id, product_id, order_item_id, start_date, end_date, status, account_id, section_id) FROM stdin;
\.


--
-- Data for Name: rental_interval; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rental_interval (id, section_id, type, start_time, account_id) FROM stdin;
\.


--
-- Data for Name: rental_order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rental_order (id, section_id, warehouse_id, entity_id, created_by, status, account_id, created_at, currency, tax_included, order_number) FROM stdin;
\.


--
-- Data for Name: rental_order_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rental_order_item (id, order_id, product_id, sort_order, account_id, unit_price, tax, discount) FROM stdin;
\.


--
-- Data for Name: rental_order_period; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rental_order_period (id, order_id, start_date, end_date, account_id) FROM stdin;
\.


--
-- Data for Name: reservation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reservation (id, order_id, order_item_id, product_id, warehouse_id, quantity, account_id, created_at) FROM stdin;
\.


--
-- Data for Name: sales_plan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_plan (id, account_id, created_at, entity_type_id, user_id, start_date, end_date, quantity, amount) FROM stdin;
\.


--
-- Data for Name: salesforce_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.salesforce_settings (id, account_id, created_at, domain, key, secret, refresh_token) FROM stdin;
\.


--
-- Data for Name: schedule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schedule (id, name, entity_type_id, account_id, created_at, products_section_id, icon, time_period, appointment_limit, type) FROM stdin;
\.


--
-- Data for Name: schedule_appointment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schedule_appointment (id, schedule_id, start_date, end_date, status, comment, owner_id, entity_id, account_id, created_at, order_id, title, performer_id) FROM stdin;
\.


--
-- Data for Name: schedule_performer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schedule_performer (schedule_id, user_id, account_id, id, department_id, type) FROM stdin;
\.


--
-- Data for Name: scheduled_mail_message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.scheduled_mail_message (id, send_to, subject, content, send_as_html, file_ids, sent_at, mailbox_id, user_id, entity_id, action_id, account_id) FROM stdin;
\.


--
-- Data for Name: shipment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipment (id, name, warehouse_id, order_id, account_id, created_at, shipped_at, status_id, section_id, entity_id, order_number) FROM stdin;
\.


--
-- Data for Name: shipment_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipment_item (id, shipment_id, product_id, quantity, account_id) FROM stdin;
\.


--
-- Data for Name: site_form; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_form (id, account_id, name, code, is_active, title, responsible_id, design, field_label_enabled, field_placeholder_enabled, created_by) FROM stdin;
\.


--
-- Data for Name: site_form_consent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_form_consent (form_id, account_id, is_enabled, text, link_url, link_text, default_value) FROM stdin;
\.


--
-- Data for Name: site_form_entity_type; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_form_entity_type (form_id, entity_type_id, account_id, board_id, is_main) FROM stdin;
\.


--
-- Data for Name: site_form_field; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_form_field (id, account_id, page_id, label, type, is_required, sort_order, placeholder) FROM stdin;
\.


--
-- Data for Name: site_form_field_entity_field; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_form_field_entity_field (form_field_id, field_id, entity_type_id, is_validation_required, meta) FROM stdin;
\.


--
-- Data for Name: site_form_field_entity_name; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_form_field_entity_name (form_field_id, entity_type_id) FROM stdin;
\.


--
-- Data for Name: site_form_gratitude; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_form_gratitude (form_id, account_id, is_enabled, header, text) FROM stdin;
\.


--
-- Data for Name: site_form_page; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_form_page (id, account_id, form_id, title, sort_order) FROM stdin;
\.


--
-- Data for Name: stage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stage (id, name, color, code, is_system, sort_order, board_id, account_id, created_at) FROM stdin;
\.


--
-- Data for Name: task; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task (id, created_at, account_id, created_by, responsible_user_id, text, start_date, end_date, is_resolved, title, entity_id, stage_id, planned_time, settings_id, resolved_date, weight, board_id) FROM stdin;
\.


--
-- Data for Name: task_comment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task_comment (id, text, task_id, created_by, account_id, created_at) FROM stdin;
\.


--
-- Data for Name: task_comment_like; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task_comment_like (comment_id, user_id, account_id) FROM stdin;
\.


--
-- Data for Name: task_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task_settings (id, active_fields, type, record_id, account_id) FROM stdin;
\.


--
-- Data for Name: task_subtask; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task_subtask (id, text, resolved, task_id, account_id, sort_order) FROM stdin;
\.


--
-- Data for Name: test_account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.test_account (account_id) FROM stdin;
\.


--
-- Data for Name: trigger; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.trigger (id, type, account_id) FROM stdin;
\.


--
-- Data for Name: tutorial_group; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tutorial_group (id, account_id, created_at, name, sort_order) FROM stdin;
\.


--
-- Data for Name: tutorial_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tutorial_item (id, account_id, group_id, created_at, name, link, sort_order) FROM stdin;
\.


--
-- Data for Name: tutorial_item_product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tutorial_item_product (id, account_id, item_id, type, object_id) FROM stdin;
\.


--
-- Data for Name: tutorial_item_user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tutorial_item_user (item_id, user_id) FROM stdin;
\.


--
-- Data for Name: user_condition; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_condition (condition_id, user_id, account_id) FROM stdin;
\.


--
-- Data for Name: user_object_permission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_object_permission (user_id, object_permission_id) FROM stdin;
\.


--
-- Data for Name: user_profile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_profile (created_at, user_id, birth_date, employment_date, account_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password, created_at, first_name, last_name, phone, account_id, role, is_active, department_id, avatar_id, "position", analytics_id) FROM stdin;
\.


--
-- Data for Name: voximplant_account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.voximplant_account (account_id, account_name, application_id, application_name, external_id, api_key, password, billing_account_id, is_active, account_email, key_id, private_key) FROM stdin;
\.


--
-- Data for Name: voximplant_call; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.voximplant_call (id, user_id, entity_id, direction, phone_number, duration, status, failure_reason, record_url, account_id, created_at, session_id, call_id, comment, number_id) FROM stdin;
\.


--
-- Data for Name: voximplant_number; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.voximplant_number (id, account_id, phone_number, external_id) FROM stdin;
\.


--
-- Data for Name: voximplant_number_user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.voximplant_number_user (number_id, user_id, account_id) FROM stdin;
\.


--
-- Data for Name: voximplant_scenario_entity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.voximplant_scenario_entity (id, account_id, scenario_type, contact_id, deal_id, board_id, owner_id) FROM stdin;
\.


--
-- Data for Name: voximplant_scenario_note; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.voximplant_scenario_note (id, account_id, scenario_type, note_text) FROM stdin;
\.


--
-- Data for Name: voximplant_scenario_task; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.voximplant_scenario_task (id, account_id, scenario_type, create_activity, activity_type_id, activity_text, activity_duration, activity_owner_id, create_task, task_title, task_text, task_duration, task_owner_id) FROM stdin;
\.


--
-- Data for Name: voximplant_user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.voximplant_user (user_id, external_id, user_name, account_id, password, is_active) FROM stdin;
\.


--
-- Data for Name: warehouse; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.warehouse (id, name, created_by, account_id, created_at, is_deleted, section_id) FROM stdin;
\.


--
-- Name: account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.account_id_seq', 11023201, false);


--
-- Name: action_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.action_id_seq', 51011001, false);


--
-- Name: activity_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_type_id_seq', 25022001, false);


--
-- Name: app_sumo_license_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.app_sumo_license_id_seq', 1, false);


--
-- Name: app_sumo_preset_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.app_sumo_preset_id_seq', 5, true);


--
-- Name: automation_entity_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.automation_entity_type_id_seq', 1, false);


--
-- Name: automation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.automation_id_seq', 51011001, false);


--
-- Name: automation_process_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.automation_process_id_seq', 1, false);


--
-- Name: board_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.board_id_seq', 14022001, false);


--
-- Name: chat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chat_id_seq', 1, false);


--
-- Name: chat_message_file_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chat_message_file_id_seq', 1, false);


--
-- Name: chat_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chat_message_id_seq', 1, false);


--
-- Name: chat_message_reaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chat_message_reaction_id_seq', 1, false);


--
-- Name: chat_provider_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chat_provider_id_seq', 1, false);


--
-- Name: chat_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chat_user_id_seq', 1, false);


--
-- Name: condition_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.condition_id_seq', 51011001, false);


--
-- Name: demo_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.demo_data_id_seq', 1, false);


--
-- Name: department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.department_id_seq', 1, false);


--
-- Name: document_template_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.document_template_id_seq', 1, false);


--
-- Name: entity_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.entity_event_id_seq', 1, false);


--
-- Name: entity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.entity_id_seq', 14022001, false);


--
-- Name: entity_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.entity_link_id_seq', 1, false);


--
-- Name: entity_list_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.entity_list_settings_id_seq', 1, false);


--
-- Name: entity_stage_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.entity_stage_history_id_seq', 1, false);


--
-- Name: entity_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.entity_type_id_seq', 13022001, false);


--
-- Name: entity_type_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.entity_type_link_id_seq', 1, false);


--
-- Name: external_entity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.external_entity_id_seq', 30022001, false);


--
-- Name: external_system_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.external_system_id_seq', 3, true);


--
-- Name: feature_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.feature_id_seq', 10, true);


--
-- Name: feed_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.feed_item_id_seq', 22022001, false);


--
-- Name: field_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.field_group_id_seq', 41022001, false);


--
-- Name: field_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.field_id_seq', 42022001, false);


--
-- Name: field_option_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.field_option_id_seq', 43022001, false);


--
-- Name: field_stage_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.field_stage_settings_id_seq', 1, false);


--
-- Name: field_user_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.field_user_settings_id_seq', 1, false);


--
-- Name: field_value_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.field_value_id_seq', 44022001, false);


--
-- Name: file_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.file_link_id_seq', 1, false);


--
-- Name: mail_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mail_message_id_seq', 28023001, false);


--
-- Name: mail_message_payload_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mail_message_payload_id_seq', 29023001, false);


--
-- Name: mailbox_folder_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mailbox_folder_id_seq', 31023001, false);


--
-- Name: mailbox_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mailbox_id_seq', 27023001, false);


--
-- Name: mailbox_signature_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mailbox_signature_id_seq', 27023001, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 408, true);


--
-- Name: notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notification_id_seq', 61011001, false);


--
-- Name: notification_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notification_settings_id_seq', 62011001, false);


--
-- Name: notification_type_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notification_type_settings_id_seq', 63011001, false);


--
-- Name: object_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.object_permission_id_seq', 1, false);


--
-- Name: order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_id_seq', 1, false);


--
-- Name: order_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_item_id_seq', 1, false);


--
-- Name: order_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_status_id_seq', 1, false);


--
-- Name: product_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_category_id_seq', 1, false);


--
-- Name: product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_id_seq', 1, false);


--
-- Name: product_module_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_module_id_seq1', 1, false);


--
-- Name: product_price_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_price_id_seq', 1, false);


--
-- Name: rental_interval_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rental_interval_id_seq', 1, false);


--
-- Name: rental_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rental_order_id_seq', 1, false);


--
-- Name: rental_order_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rental_order_item_id_seq', 1, false);


--
-- Name: rental_order_period_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rental_order_period_id_seq', 1, false);


--
-- Name: rental_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rental_schedule_id_seq', 1, false);


--
-- Name: reservation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reservation_id_seq', 1, false);


--
-- Name: sales_plan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sales_plan_id_seq', 1, false);


--
-- Name: schedule_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.schedule_event_id_seq', 1, false);


--
-- Name: schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.schedule_id_seq', 1, false);


--
-- Name: schedule_performer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.schedule_performer_id_seq', 1, false);


--
-- Name: scheduled_action_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.scheduled_action_id_seq', 1, false);


--
-- Name: scheduled_mail_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.scheduled_mail_message_id_seq', 1, false);


--
-- Name: shipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shipment_id_seq', 1, false);


--
-- Name: shipment_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shipment_item_id_seq', 1, false);


--
-- Name: site_form_field_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.site_form_field_id_seq', 1, false);


--
-- Name: site_form_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.site_form_id_seq', 1, false);


--
-- Name: site_form_page_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.site_form_page_id_seq', 1, false);


--
-- Name: stage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stage_id_seq', 15022001, false);


--
-- Name: subtask_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subtask_id_seq', 46022001, false);


--
-- Name: task_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.task_comment_id_seq', 47022001, false);


--
-- Name: task_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.task_settings_id_seq', 45022001, false);


--
-- Name: trigger_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.trigger_id_seq', 51011001, false);


--
-- Name: tutorial_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tutorial_group_id_seq', 1, false);


--
-- Name: tutorial_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tutorial_item_id_seq', 1, false);


--
-- Name: tutorial_item_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tutorial_item_product_id_seq', 1, false);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_id_seq', 12022001, false);


--
-- Name: voximplant_call_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.voximplant_call_id_seq', 1, false);


--
-- Name: voximplant_number_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.voximplant_number_id_seq', 1, false);


--
-- Name: voximplant_scenario_entity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.voximplant_scenario_entity_id_seq', 1, false);


--
-- Name: voximplant_scenario_note_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.voximplant_scenario_note_id_seq', 1, false);


--
-- Name: voximplant_scenario_task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.voximplant_scenario_task_id_seq', 1, false);


--
-- Name: warehouse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.warehouse_id_seq', 1, false);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: account_api_access account_api_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_api_access
    ADD CONSTRAINT account_api_access_pkey PRIMARY KEY (account_id);


--
-- Name: account_settings account_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_settings
    ADD CONSTRAINT account_settings_pkey PRIMARY KEY (account_id);


--
-- Name: account accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: account accounts_subdomain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT accounts_subdomain_key UNIQUE (subdomain);


--
-- Name: action action_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action
    ADD CONSTRAINT action_pkey PRIMARY KEY (id);


--
-- Name: action_activity_settings activity_action_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity_settings
    ADD CONSTRAINT activity_action_settings_pkey PRIMARY KEY (action_id);


--
-- Name: activity activity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT activity_pkey PRIMARY KEY (id);


--
-- Name: appsumo_license app_sumo_license_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appsumo_license
    ADD CONSTRAINT app_sumo_license_pkey PRIMARY KEY (id);


--
-- Name: appsumo_tier app_sumo_preset_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appsumo_tier
    ADD CONSTRAINT app_sumo_preset_pkey PRIMARY KEY (id);


--
-- Name: appsumo_license appsumo_license_license_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appsumo_license
    ADD CONSTRAINT appsumo_license_license_key_key UNIQUE (license_key);


--
-- Name: automation_condition automation_condition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_condition
    ADD CONSTRAINT automation_condition_pkey PRIMARY KEY (automation_id, condition_id);


--
-- Name: automation_entity_type automation_entity_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_entity_type
    ADD CONSTRAINT automation_entity_type_pkey PRIMARY KEY (id);


--
-- Name: automation automation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation
    ADD CONSTRAINT automation_pkey PRIMARY KEY (id);


--
-- Name: automation_process automation_process_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_process
    ADD CONSTRAINT automation_process_pkey PRIMARY KEY (id);


--
-- Name: automation_stage automation_stage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_stage
    ADD CONSTRAINT automation_stage_pkey PRIMARY KEY (automation_id, stage_id);


--
-- Name: board board__code__account_id__uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board
    ADD CONSTRAINT board__code__account_id__uniq UNIQUE (code, account_id);


--
-- Name: board board_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board
    ADD CONSTRAINT board_pkey PRIMARY KEY (id);


--
-- Name: chat_message_file chat_message_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_file
    ADD CONSTRAINT chat_message_file_pkey PRIMARY KEY (id);


--
-- Name: chat_message chat_message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_pkey PRIMARY KEY (id);


--
-- Name: chat_message_reaction chat_message_reaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_reaction
    ADD CONSTRAINT chat_message_reaction_pkey PRIMARY KEY (id);


--
-- Name: chat_message_user_status chat_message_user_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_user_status
    ADD CONSTRAINT chat_message_user_status_pkey PRIMARY KEY (chat_id, message_id, chat_user_id);


--
-- Name: chat_pinned_message chat_pinned_message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_pinned_message
    ADD CONSTRAINT chat_pinned_message_pkey PRIMARY KEY (chat_id, message_id);


--
-- Name: chat chat_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_pkey PRIMARY KEY (id);


--
-- Name: chat_provider_messenger chat_provider_messenger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_provider_messenger
    ADD CONSTRAINT chat_provider_messenger_pkey PRIMARY KEY (provider_id);


--
-- Name: chat_provider chat_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_provider
    ADD CONSTRAINT chat_provider_pkey PRIMARY KEY (id);


--
-- Name: chat_provider_twilio chat_provider_twilio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_provider_twilio
    ADD CONSTRAINT chat_provider_twilio_pkey PRIMARY KEY (provider_id);


--
-- Name: chat_provider_user chat_provider_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_provider_user
    ADD CONSTRAINT chat_provider_user_pkey PRIMARY KEY (provider_id, user_id, type);


--
-- Name: chat_provider_wazzup chat_provider_wazzup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_provider_wazzup
    ADD CONSTRAINT chat_provider_wazzup_pkey PRIMARY KEY (provider_id);


--
-- Name: chat_user_external chat_user_external_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_user_external
    ADD CONSTRAINT chat_user_external_pkey PRIMARY KEY (chat_user_id);


--
-- Name: chat_user chat_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_user
    ADD CONSTRAINT chat_user_pkey PRIMARY KEY (id);


--
-- Name: condition condition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.condition
    ADD CONSTRAINT condition_pkey PRIMARY KEY (id);


--
-- Name: demo_data demo_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demo_data
    ADD CONSTRAINT demo_data_pkey PRIMARY KEY (id);


--
-- Name: department department_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_pkey PRIMARY KEY (id);


--
-- Name: document_template_access document_template_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_template_access
    ADD CONSTRAINT document_template_access_pkey PRIMARY KEY (document_template_id, user_id);


--
-- Name: document_template_entity_type document_template_entity_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_template_entity_type
    ADD CONSTRAINT document_template_entity_type_pkey PRIMARY KEY (document_template_id, entity_type_id);


--
-- Name: document_template document_template_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_template
    ADD CONSTRAINT document_template_pkey PRIMARY KEY (id);


--
-- Name: action_email_settings email_action_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_email_settings
    ADD CONSTRAINT email_action_settings_pkey PRIMARY KEY (action_id);


--
-- Name: action_entity_settings entity_action_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_entity_settings
    ADD CONSTRAINT entity_action_settings_pkey PRIMARY KEY (action_id);


--
-- Name: entity_event entity_event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_event
    ADD CONSTRAINT entity_event_pkey PRIMARY KEY (id);


--
-- Name: entity_link entity_link_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_link
    ADD CONSTRAINT entity_link_pkey PRIMARY KEY (id);


--
-- Name: entity_list_settings entity_list_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_list_settings
    ADD CONSTRAINT entity_list_settings_pkey PRIMARY KEY (id);


--
-- Name: entity entity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity
    ADD CONSTRAINT entity_pkey PRIMARY KEY (id);


--
-- Name: entity_stage_history entity_stage_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_stage_history
    ADD CONSTRAINT entity_stage_history_pkey PRIMARY KEY (id);


--
-- Name: entity_type_feature entity_type_feature_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_type_feature
    ADD CONSTRAINT entity_type_feature_pkey PRIMARY KEY (entity_type_id, feature_id);


--
-- Name: entity_type_link entity_type_link_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_type_link
    ADD CONSTRAINT entity_type_link_pkey PRIMARY KEY (id);


--
-- Name: entity_type entity_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_type
    ADD CONSTRAINT entity_type_pkey PRIMARY KEY (id);


--
-- Name: exact_time_trigger_settings exact_time_trigger_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exact_time_trigger_settings
    ADD CONSTRAINT exact_time_trigger_settings_pkey PRIMARY KEY (trigger_id);


--
-- Name: external_entity external_entity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_entity
    ADD CONSTRAINT external_entity_pkey PRIMARY KEY (id);


--
-- Name: external_system external_system_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_system
    ADD CONSTRAINT external_system_pkey PRIMARY KEY (id);


--
-- Name: feature feature_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature
    ADD CONSTRAINT feature_pkey PRIMARY KEY (id);


--
-- Name: field field__code__entity_type_id__uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field
    ADD CONSTRAINT field__code__entity_type_id__uniq UNIQUE (code, entity_type_id);


--
-- Name: field_condition field_condition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_condition
    ADD CONSTRAINT field_condition_pkey PRIMARY KEY (condition_id);


--
-- Name: field_group field_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_group
    ADD CONSTRAINT field_group_pkey PRIMARY KEY (id);


--
-- Name: field_value field_id__entity_id__uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_value
    ADD CONSTRAINT field_id__entity_id__uniq UNIQUE (field_id, entity_id);


--
-- Name: field_option field_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_option
    ADD CONSTRAINT field_option_pkey PRIMARY KEY (id);


--
-- Name: field field_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field
    ADD CONSTRAINT field_pkey PRIMARY KEY (id);


--
-- Name: field_stage_settings field_stage_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_stage_settings
    ADD CONSTRAINT field_stage_settings_pkey PRIMARY KEY (id);


--
-- Name: field_user_settings field_user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_user_settings
    ADD CONSTRAINT field_user_settings_pkey PRIMARY KEY (id);


--
-- Name: field_value field_value_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_value
    ADD CONSTRAINT field_value_pkey PRIMARY KEY (id);


--
-- Name: file_info file_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_info
    ADD CONSTRAINT file_info_pkey PRIMARY KEY (id);


--
-- Name: file_link file_link_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_link
    ADD CONSTRAINT file_link_pkey PRIMARY KEY (id);


--
-- Name: industry industry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry
    ADD CONSTRAINT industry_pkey PRIMARY KEY (code);


--
-- Name: mail_message_folder mail_message_folder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_message_folder
    ADD CONSTRAINT mail_message_folder_pkey PRIMARY KEY (message_id, folder_id);


--
-- Name: mail_message_payload mail_message_payload_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_message_payload
    ADD CONSTRAINT mail_message_payload_pkey PRIMARY KEY (id);


--
-- Name: mail_message mail_message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_message
    ADD CONSTRAINT mail_message_pkey PRIMARY KEY (id);


--
-- Name: mailbox_accessible_user mailbox_accessible_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_accessible_user
    ADD CONSTRAINT mailbox_accessible_user_pkey PRIMARY KEY (mailbox_id, user_id);


--
-- Name: mailbox_folder mailbox_folder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_folder
    ADD CONSTRAINT mailbox_folder_pkey PRIMARY KEY (id);


--
-- Name: mailbox mailbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox
    ADD CONSTRAINT mailbox_pkey PRIMARY KEY (id);


--
-- Name: mailbox_settings_gmail mailbox_settings_gmail_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_settings_gmail
    ADD CONSTRAINT mailbox_settings_gmail_pkey PRIMARY KEY (mailbox_id);


--
-- Name: mailbox_settings_manual mailbox_settings_manual_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_settings_manual
    ADD CONSTRAINT mailbox_settings_manual_pkey PRIMARY KEY (mailbox_id);


--
-- Name: mailbox_signature_link mailbox_signature_link_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_signature_link
    ADD CONSTRAINT mailbox_signature_link_pkey PRIMARY KEY (signature_id, mailbox_id);


--
-- Name: mailbox_signature mailbox_signature_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_signature
    ADD CONSTRAINT mailbox_signature_pkey PRIMARY KEY (id);


--
-- Name: note note_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note
    ADD CONSTRAINT note_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: notification_settings notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_pkey PRIMARY KEY (id);


--
-- Name: notification_type_follow_user notification_type_follow_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_type_follow_user
    ADD CONSTRAINT notification_type_follow_user_pkey PRIMARY KEY (type_id, user_id);


--
-- Name: notification_type_settings notification_type_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_type_settings
    ADD CONSTRAINT notification_type_settings_pkey PRIMARY KEY (id);


--
-- Name: object_permission object_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.object_permission
    ADD CONSTRAINT object_permission_pkey PRIMARY KEY (id);


--
-- Name: order_item order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_pkey PRIMARY KEY (id);


--
-- Name: order_status order_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status
    ADD CONSTRAINT order_status_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_category product_category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_category
    ADD CONSTRAINT product_category_pkey PRIMARY KEY (id);


--
-- Name: products_section product_module_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_section
    ADD CONSTRAINT product_module_pkey PRIMARY KEY (id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: product_price product_price_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_price
    ADD CONSTRAINT product_price_pkey PRIMARY KEY (id);


--
-- Name: products_section_entity_type products_section_entity_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_section_entity_type
    ADD CONSTRAINT products_section_entity_type_pkey PRIMARY KEY (section_id, entity_type_id);


--
-- Name: ready_made_solution ready_made_solution_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ready_made_solution
    ADD CONSTRAINT ready_made_solution_pkey PRIMARY KEY (code);


--
-- Name: rental_interval rental_interval_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_interval
    ADD CONSTRAINT rental_interval_pkey PRIMARY KEY (id);


--
-- Name: rental_order_item rental_order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_order_item
    ADD CONSTRAINT rental_order_item_pkey PRIMARY KEY (id);


--
-- Name: rental_order_period rental_order_period_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_order_period
    ADD CONSTRAINT rental_order_period_pkey PRIMARY KEY (id);


--
-- Name: rental_order rental_order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_order
    ADD CONSTRAINT rental_order_pkey PRIMARY KEY (id);


--
-- Name: rental_event rental_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_event
    ADD CONSTRAINT rental_schedule_pkey PRIMARY KEY (id);


--
-- Name: reservation reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_pkey PRIMARY KEY (id);


--
-- Name: sales_plan sales_plan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_plan
    ADD CONSTRAINT sales_plan_pkey PRIMARY KEY (id);


--
-- Name: salesforce_settings salesforce_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salesforce_settings
    ADD CONSTRAINT salesforce_settings_pkey PRIMARY KEY (id);


--
-- Name: schedule_appointment schedule_event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_appointment
    ADD CONSTRAINT schedule_event_pkey PRIMARY KEY (id);


--
-- Name: schedule_performer schedule_performer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_performer
    ADD CONSTRAINT schedule_performer_pkey PRIMARY KEY (id);


--
-- Name: schedule schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT schedule_pkey PRIMARY KEY (id);


--
-- Name: action_scheduled scheduled_action_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_scheduled
    ADD CONSTRAINT scheduled_action_pkey PRIMARY KEY (id);


--
-- Name: scheduled_mail_message scheduled_mail_message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_mail_message
    ADD CONSTRAINT scheduled_mail_message_pkey PRIMARY KEY (id);


--
-- Name: shipment_item shipment_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipment_item
    ADD CONSTRAINT shipment_item_pkey PRIMARY KEY (id);


--
-- Name: shipment shipment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipment
    ADD CONSTRAINT shipment_pkey PRIMARY KEY (id);


--
-- Name: site_form site_form_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form
    ADD CONSTRAINT site_form_code_key UNIQUE (code);


--
-- Name: site_form_consent site_form_consent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_consent
    ADD CONSTRAINT site_form_consent_pkey PRIMARY KEY (form_id);


--
-- Name: site_form_entity_type site_form_entity_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_entity_type
    ADD CONSTRAINT site_form_entity_type_pkey PRIMARY KEY (form_id, entity_type_id);


--
-- Name: site_form_field_entity_field site_form_field_entity_field_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_field_entity_field
    ADD CONSTRAINT site_form_field_entity_field_pkey PRIMARY KEY (form_field_id);


--
-- Name: site_form_field_entity_name site_form_field_entity_name_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_field_entity_name
    ADD CONSTRAINT site_form_field_entity_name_pkey PRIMARY KEY (form_field_id);


--
-- Name: site_form_field site_form_field_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_field
    ADD CONSTRAINT site_form_field_pkey PRIMARY KEY (id);


--
-- Name: site_form_gratitude site_form_gratitude_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_gratitude
    ADD CONSTRAINT site_form_gratitude_pkey PRIMARY KEY (form_id);


--
-- Name: site_form_page site_form_page_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_page
    ADD CONSTRAINT site_form_page_pkey PRIMARY KEY (id);


--
-- Name: site_form site_form_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form
    ADD CONSTRAINT site_form_pkey PRIMARY KEY (id);


--
-- Name: stage stage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage
    ADD CONSTRAINT stage_pkey PRIMARY KEY (id);


--
-- Name: product_stock stock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_stock
    ADD CONSTRAINT stock_pkey PRIMARY KEY (product_id, warehouse_id);


--
-- Name: account_subscription subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_subscription
    ADD CONSTRAINT subscription_pkey PRIMARY KEY (account_id);


--
-- Name: task_subtask subtask_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_subtask
    ADD CONSTRAINT subtask_pkey PRIMARY KEY (id);


--
-- Name: action_task_settings task_action_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_task_settings
    ADD CONSTRAINT task_action_settings_pkey PRIMARY KEY (action_id);


--
-- Name: task_comment_like task_comment_like_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comment_like
    ADD CONSTRAINT task_comment_like_pkey PRIMARY KEY (comment_id, user_id);


--
-- Name: task_comment task_comment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comment
    ADD CONSTRAINT task_comment_pkey PRIMARY KEY (id);


--
-- Name: task task_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_pkey PRIMARY KEY (id);


--
-- Name: task_settings task_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_settings
    ADD CONSTRAINT task_settings_pkey PRIMARY KEY (id);


--
-- Name: activity_type task_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_type
    ADD CONSTRAINT task_type_pkey PRIMARY KEY (id);


--
-- Name: test_account test_account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_account
    ADD CONSTRAINT test_account_pkey PRIMARY KEY (account_id);


--
-- Name: trigger trigger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trigger
    ADD CONSTRAINT trigger_pkey PRIMARY KEY (id);


--
-- Name: tutorial_group tutorial_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_group
    ADD CONSTRAINT tutorial_group_pkey PRIMARY KEY (id);


--
-- Name: tutorial_item tutorial_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_item
    ADD CONSTRAINT tutorial_item_pkey PRIMARY KEY (id);


--
-- Name: tutorial_item_product tutorial_item_product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_item_product
    ADD CONSTRAINT tutorial_item_product_pkey PRIMARY KEY (id);


--
-- Name: tutorial_item_user tutorial_item_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_item_user
    ADD CONSTRAINT tutorial_item_user_pkey PRIMARY KEY (item_id, user_id);


--
-- Name: user_condition user_condition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_condition
    ADD CONSTRAINT user_condition_pkey PRIMARY KEY (condition_id, user_id);


--
-- Name: user_object_permission user_object_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_object_permission
    ADD CONSTRAINT user_object_permission_pkey PRIMARY KEY (user_id, object_permission_id);


--
-- Name: user_profile user_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_pkey PRIMARY KEY (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: voximplant_account voximplant_account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_account
    ADD CONSTRAINT voximplant_account_pkey PRIMARY KEY (account_id);


--
-- Name: voximplant_call voximplant_call_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_call
    ADD CONSTRAINT voximplant_call_pkey PRIMARY KEY (id);


--
-- Name: voximplant_number voximplant_number_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_number
    ADD CONSTRAINT voximplant_number_pkey PRIMARY KEY (id);


--
-- Name: voximplant_number_user voximplant_number_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_number_user
    ADD CONSTRAINT voximplant_number_user_pkey PRIMARY KEY (number_id, user_id);


--
-- Name: voximplant_scenario_entity voximplant_scenario_entity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_scenario_entity
    ADD CONSTRAINT voximplant_scenario_entity_pkey PRIMARY KEY (id);


--
-- Name: voximplant_scenario_note voximplant_scenario_note_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_scenario_note
    ADD CONSTRAINT voximplant_scenario_note_pkey PRIMARY KEY (id);


--
-- Name: voximplant_scenario_task voximplant_scenario_task_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_scenario_task
    ADD CONSTRAINT voximplant_scenario_task_pkey PRIMARY KEY (id);


--
-- Name: voximplant_user voximplant_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_user
    ADD CONSTRAINT voximplant_user_pkey PRIMARY KEY (user_id);


--
-- Name: warehouse warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse
    ADD CONSTRAINT warehouse_pkey PRIMARY KEY (id);


--
-- Name: activity_entity_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_entity_id_idx ON public.activity USING btree (entity_id);


--
-- Name: activity_is_resolved_end_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_is_resolved_end_date_idx ON public.activity USING btree (is_resolved, end_date);


--
-- Name: activity_is_resolved_responsible_user_id_start_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_is_resolved_responsible_user_id_start_date_idx ON public.activity USING btree (is_resolved, responsible_user_id, start_date);


--
-- Name: board_account_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX board_account_id_idx ON public.board USING btree (account_id);


--
-- Name: board_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX board_type_idx ON public.board USING btree (type);


--
-- Name: department_account_id_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX department_account_id_parent_id_idx ON public.department USING btree (account_id, parent_id);


--
-- Name: entity_entity_type_id_stage_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entity_entity_type_id_stage_id_idx ON public.entity USING btree (entity_type_id, stage_id);


--
-- Name: entity_link_source_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entity_link_source_id_idx ON public.entity_link USING btree (source_id);


--
-- Name: entity_link_source_id_sort_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entity_link_source_id_sort_order_id_idx ON public.entity_link USING btree (source_id, sort_order, id);


--
-- Name: entity_link_target_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entity_link_target_id_idx ON public.entity_link USING btree (target_id);


--
-- Name: entity_type_link_account_id_source_id_sort_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entity_type_link_account_id_source_id_sort_order_id_idx ON public.entity_type_link USING btree (account_id, source_id, sort_order, id);


--
-- Name: exact_time_trigger_settings_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exact_time_trigger_settings_date_idx ON public.exact_time_trigger_settings USING btree (date);


--
-- Name: field_entity_type_id_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX field_entity_type_id_type_idx ON public.field USING btree (entity_type_id, type);


--
-- Name: field_group_account_id_entity_type_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX field_group_account_id_entity_type_id_idx ON public.field_group USING btree (account_id, entity_type_id);


--
-- Name: field_option_field_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX field_option_field_id_idx ON public.field_option USING btree (field_id);


--
-- Name: field_value_account_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX field_value_account_id_idx ON public.field_value USING btree (account_id);


--
-- Name: field_value_entity_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX field_value_entity_id_idx ON public.field_value USING btree (entity_id);


--
-- Name: file_link_account_id_source_type_source_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX file_link_account_id_source_type_source_id_idx ON public.file_link USING btree (account_id, source_type, source_id);


--
-- Name: idx_chat_on_account_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_on_account_id ON public.chat USING btree (account_id);


--
-- Name: idx_chat_user_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_user_on_user_id ON public.chat_user USING btree (user_id);


--
-- Name: idx_chat_user_on_user_id_chat_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_user_on_user_id_chat_id ON public.chat_user USING btree (user_id, chat_id);


--
-- Name: idx_cmus_on_message_id_chat_id_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cmus_on_message_id_chat_id_status ON public.chat_message_user_status USING btree (message_id, chat_id, status);


--
-- Name: idx_cmus_on_message_id_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cmus_on_message_id_status ON public.chat_message_user_status USING btree (message_id, status);


--
-- Name: idx_entity_account_id_stage_id_closed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_entity_account_id_stage_id_closed_at ON public.entity USING btree (account_id, stage_id, closed_at);


--
-- Name: idx_field_value_entity_id_field_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_field_value_entity_id_field_type ON public.field_value USING btree (entity_id, field_type);


--
-- Name: idx_mail_message_account_mailbox; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_message_account_mailbox ON public.mail_message USING btree (account_id, mailbox_id);


--
-- Name: idx_mail_message_external_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_message_external_id ON public.mail_message USING btree (external_id);


--
-- Name: idx_mail_message_message_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_message_message_id ON public.mail_message USING btree (message_id);


--
-- Name: idx_mailbox_folder_account_mailbox; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mailbox_folder_account_mailbox ON public.mailbox_folder USING btree (account_id, mailbox_id);


--
-- Name: mail_message_entity_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mail_message_entity_id_idx ON public.mail_message USING btree (entity_id);


--
-- Name: mailbox_folder_account_id_mailbox_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mailbox_folder_account_id_mailbox_id_idx ON public.mailbox_folder USING btree (account_id, mailbox_id);


--
-- Name: note_entity_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX note_entity_id_idx ON public.note USING btree (entity_id);


--
-- Name: notification_account_user_seen_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_account_user_seen_idx ON public.notification USING btree (account_id, user_id, is_seen);


--
-- Name: notification_settings_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_settings_user_id_idx ON public.notification_settings USING btree (user_id);


--
-- Name: notification_type_settings_on_type_enabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_type_settings_on_type_enabled_idx ON public.notification_type_settings USING btree (type) WHERE (is_enabled = true);


--
-- Name: object_permission_object_type_object_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX object_permission_object_type_object_id_idx ON public.object_permission USING btree (object_type, object_id);


--
-- Name: scheduled_action_scheduled_time_completed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX scheduled_action_scheduled_time_completed_idx ON public.action_scheduled USING btree (scheduled_time, completed);


--
-- Name: scheduled_mail_message_mailbox_id_sent_at_null_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX scheduled_mail_message_mailbox_id_sent_at_null_idx ON public.scheduled_mail_message USING btree (mailbox_id) WHERE (sent_at IS NULL);


--
-- Name: stage_account_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stage_account_id_idx ON public.stage USING btree (account_id);


--
-- Name: stage_board_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stage_board_id_idx ON public.stage USING btree (board_id);


--
-- Name: subtask_account_id_task_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subtask_account_id_task_id_idx ON public.task_subtask USING btree (account_id, task_id);


--
-- Name: task_account_id_responsible_user_id_stage_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX task_account_id_responsible_user_id_stage_id_idx ON public.task USING btree (account_id, responsible_user_id, stage_id);


--
-- Name: task_entity_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX task_entity_id_idx ON public.task USING btree (entity_id);


--
-- Name: task_entity_id_is_resolved_created_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX task_entity_id_is_resolved_created_by_idx ON public.task USING btree (entity_id, is_resolved, created_by);


--
-- Name: task_is_resolved_end_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX task_is_resolved_end_date_idx ON public.task USING btree (is_resolved, end_date);


--
-- Name: task_is_resolved_responsible_user_id_start_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX task_is_resolved_responsible_user_id_start_date_idx ON public.task USING btree (is_resolved, responsible_user_id, start_date);


--
-- Name: user_object_permission_user_id_object_permission_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_object_permission_user_id_object_permission_id_idx ON public.user_object_permission USING btree (user_id, object_permission_id);


--
-- Name: users_account_id_department_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_account_id_department_id_idx ON public.users USING btree (account_id, department_id);


--
-- Name: users_account_id_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_account_id_id_idx ON public.users USING btree (account_id, id);


--
-- Name: account_api_access account_api_access_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_api_access
    ADD CONSTRAINT account_api_access_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: account_settings account_settings_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_settings
    ADD CONSTRAINT account_settings_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: action action_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action
    ADD CONSTRAINT action_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: activity activity_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT activity_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: action_activity_settings activity_action_settings_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity_settings
    ADD CONSTRAINT activity_action_settings_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: action_activity_settings activity_action_settings_action_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity_settings
    ADD CONSTRAINT activity_action_settings_action_id_fkey FOREIGN KEY (action_id) REFERENCES public.action(id) ON DELETE CASCADE;


--
-- Name: action_activity_settings activity_action_settings_activity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity_settings
    ADD CONSTRAINT activity_action_settings_activity_type_id_fkey FOREIGN KEY (activity_type_id) REFERENCES public.activity_type(id) ON DELETE CASCADE;


--
-- Name: action_activity_settings activity_action_settings_responsible_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity_settings
    ADD CONSTRAINT activity_action_settings_responsible_user_id_fkey FOREIGN KEY (responsible_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: activity activity_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT activity_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: activity activity_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT activity_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE CASCADE;


--
-- Name: activity activity_responsible_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT activity_responsible_user_id_fkey FOREIGN KEY (responsible_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: activity activity_task_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT activity_task_type_id_fkey FOREIGN KEY (activity_type_id) REFERENCES public.activity_type(id) ON DELETE CASCADE;


--
-- Name: appsumo_license app_sumo_license_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appsumo_license
    ADD CONSTRAINT app_sumo_license_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE SET NULL;


--
-- Name: automation automation_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation
    ADD CONSTRAINT automation_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: automation automation_action_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation
    ADD CONSTRAINT automation_action_id_fkey FOREIGN KEY (action_id) REFERENCES public.action(id);


--
-- Name: automation_condition automation_condition_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_condition
    ADD CONSTRAINT automation_condition_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: automation_condition automation_condition_automation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_condition
    ADD CONSTRAINT automation_condition_automation_id_fkey FOREIGN KEY (automation_id) REFERENCES public.automation(id) ON DELETE CASCADE;


--
-- Name: automation_condition automation_condition_condition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_condition
    ADD CONSTRAINT automation_condition_condition_id_fkey FOREIGN KEY (condition_id) REFERENCES public.condition(id) ON DELETE CASCADE;


--
-- Name: automation automation_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation
    ADD CONSTRAINT automation_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: automation_entity_type automation_entity_type_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_entity_type
    ADD CONSTRAINT automation_entity_type_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: automation_entity_type automation_entity_type_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_entity_type
    ADD CONSTRAINT automation_entity_type_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.board(id);


--
-- Name: automation_entity_type automation_entity_type_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_entity_type
    ADD CONSTRAINT automation_entity_type_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: automation_entity_type automation_entity_type_entity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_entity_type
    ADD CONSTRAINT automation_entity_type_entity_type_id_fkey FOREIGN KEY (entity_type_id) REFERENCES public.entity_type(id);


--
-- Name: automation_entity_type automation_entity_type_process_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_entity_type
    ADD CONSTRAINT automation_entity_type_process_id_fkey FOREIGN KEY (process_id) REFERENCES public.automation_process(id) ON DELETE CASCADE;


--
-- Name: automation_entity_type automation_entity_type_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_entity_type
    ADD CONSTRAINT automation_entity_type_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.stage(id);


--
-- Name: automation_process automation_process_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_process
    ADD CONSTRAINT automation_process_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: automation_stage automation_stage_automation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_stage
    ADD CONSTRAINT automation_stage_automation_id_fkey FOREIGN KEY (automation_id) REFERENCES public.automation(id) ON DELETE CASCADE;


--
-- Name: automation_stage automation_stage_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_stage
    ADD CONSTRAINT automation_stage_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.stage(id) ON DELETE CASCADE;


--
-- Name: automation automation_trigger_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation
    ADD CONSTRAINT automation_trigger_id_fkey FOREIGN KEY (trigger_id) REFERENCES public.trigger(id);


--
-- Name: board board_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board
    ADD CONSTRAINT board_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: board board_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board
    ADD CONSTRAINT board_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: board board_task_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board
    ADD CONSTRAINT board_task_board_id_fkey FOREIGN KEY (task_board_id) REFERENCES public.board(id) ON DELETE SET NULL;


--
-- Name: action_entity_settings change_stage_action_settings_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_entity_settings
    ADD CONSTRAINT change_stage_action_settings_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: action_entity_settings change_stage_action_settings_action_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_entity_settings
    ADD CONSTRAINT change_stage_action_settings_action_id_fkey FOREIGN KEY (action_id) REFERENCES public.action(id) ON DELETE CASCADE;


--
-- Name: action_entity_settings change_stage_action_settings_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_entity_settings
    ADD CONSTRAINT change_stage_action_settings_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.stage(id) ON DELETE CASCADE;


--
-- Name: chat chat_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: chat chat_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: chat chat_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE SET NULL;


--
-- Name: chat_message chat_message_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: chat_message chat_message_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chat(id) ON DELETE CASCADE;


--
-- Name: chat_message chat_message_chat_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_chat_user_id_fkey FOREIGN KEY (chat_user_id) REFERENCES public.chat_user(id) ON DELETE CASCADE;


--
-- Name: chat_message_file chat_message_file_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_file
    ADD CONSTRAINT chat_message_file_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: chat_message_file chat_message_file_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_file
    ADD CONSTRAINT chat_message_file_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.chat_message(id) ON DELETE CASCADE;


--
-- Name: chat_message_reaction chat_message_reaction_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_reaction
    ADD CONSTRAINT chat_message_reaction_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: chat_message_reaction chat_message_reaction_chat_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_reaction
    ADD CONSTRAINT chat_message_reaction_chat_user_id_fkey FOREIGN KEY (chat_user_id) REFERENCES public.chat_user(id) ON DELETE CASCADE;


--
-- Name: chat_message_reaction chat_message_reaction_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_reaction
    ADD CONSTRAINT chat_message_reaction_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.chat_message(id) ON DELETE CASCADE;


--
-- Name: chat_message chat_message_reply_to_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_reply_to_id_fkey FOREIGN KEY (reply_to_id) REFERENCES public.chat_message(id) ON DELETE SET NULL;


--
-- Name: chat_message_user_status chat_message_user_status_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_user_status
    ADD CONSTRAINT chat_message_user_status_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: chat_message_user_status chat_message_user_status_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_user_status
    ADD CONSTRAINT chat_message_user_status_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chat(id) ON DELETE CASCADE;


--
-- Name: chat_message_user_status chat_message_user_status_chat_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_user_status
    ADD CONSTRAINT chat_message_user_status_chat_user_id_fkey FOREIGN KEY (chat_user_id) REFERENCES public.chat_user(id) ON DELETE CASCADE;


--
-- Name: chat_message_user_status chat_message_user_status_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_user_status
    ADD CONSTRAINT chat_message_user_status_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.chat_message(id) ON DELETE CASCADE;


--
-- Name: chat_pinned_message chat_pinned_message_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_pinned_message
    ADD CONSTRAINT chat_pinned_message_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: chat_pinned_message chat_pinned_message_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_pinned_message
    ADD CONSTRAINT chat_pinned_message_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chat(id) ON DELETE CASCADE;


--
-- Name: chat_pinned_message chat_pinned_message_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_pinned_message
    ADD CONSTRAINT chat_pinned_message_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.chat_message(id) ON DELETE CASCADE;


--
-- Name: chat_provider chat_provider_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_provider
    ADD CONSTRAINT chat_provider_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: chat_provider chat_provider_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_provider
    ADD CONSTRAINT chat_provider_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: chat chat_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.chat_provider(id) ON DELETE CASCADE;


--
-- Name: chat_provider_messenger chat_provider_messenger_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_provider_messenger
    ADD CONSTRAINT chat_provider_messenger_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: chat_provider_messenger chat_provider_messenger_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_provider_messenger
    ADD CONSTRAINT chat_provider_messenger_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.chat_provider(id) ON DELETE CASCADE;


--
-- Name: chat_provider_twilio chat_provider_twilio_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_provider_twilio
    ADD CONSTRAINT chat_provider_twilio_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: chat_provider_twilio chat_provider_twilio_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_provider_twilio
    ADD CONSTRAINT chat_provider_twilio_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.chat_provider(id) ON DELETE CASCADE;


--
-- Name: chat_provider_user chat_provider_user_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_provider_user
    ADD CONSTRAINT chat_provider_user_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: chat_provider_user chat_provider_user_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_provider_user
    ADD CONSTRAINT chat_provider_user_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.chat_provider(id) ON DELETE CASCADE;


--
-- Name: chat_provider_user chat_provider_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_provider_user
    ADD CONSTRAINT chat_provider_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chat_provider_wazzup chat_provider_wazzup_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_provider_wazzup
    ADD CONSTRAINT chat_provider_wazzup_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: chat_provider_wazzup chat_provider_wazzup_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_provider_wazzup
    ADD CONSTRAINT chat_provider_wazzup_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.chat_provider(id) ON DELETE CASCADE;


--
-- Name: chat_user chat_user_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_user
    ADD CONSTRAINT chat_user_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: chat_user chat_user_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_user
    ADD CONSTRAINT chat_user_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chat(id) ON DELETE CASCADE;


--
-- Name: chat_user_external chat_user_external_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_user_external
    ADD CONSTRAINT chat_user_external_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: chat_user_external chat_user_external_chat_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_user_external
    ADD CONSTRAINT chat_user_external_chat_user_id_fkey FOREIGN KEY (chat_user_id) REFERENCES public.chat_user(id) ON DELETE CASCADE;


--
-- Name: chat_user chat_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_user
    ADD CONSTRAINT chat_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: condition condition_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.condition
    ADD CONSTRAINT condition_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: demo_data demo_data_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demo_data
    ADD CONSTRAINT demo_data_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: department department_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: department department_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.department(id) ON DELETE CASCADE;


--
-- Name: document_template_access document_template_access_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_template_access
    ADD CONSTRAINT document_template_access_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: document_template_access document_template_access_document_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_template_access
    ADD CONSTRAINT document_template_access_document_template_id_fkey FOREIGN KEY (document_template_id) REFERENCES public.document_template(id) ON DELETE CASCADE;


--
-- Name: document_template_access document_template_access_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_template_access
    ADD CONSTRAINT document_template_access_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: document_template document_template_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_template
    ADD CONSTRAINT document_template_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: document_template document_template_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_template
    ADD CONSTRAINT document_template_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: document_template_entity_type document_template_entity_type_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_template_entity_type
    ADD CONSTRAINT document_template_entity_type_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: document_template_entity_type document_template_entity_type_document_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_template_entity_type
    ADD CONSTRAINT document_template_entity_type_document_template_id_fkey FOREIGN KEY (document_template_id) REFERENCES public.document_template(id) ON DELETE CASCADE;


--
-- Name: document_template_entity_type document_template_entity_type_entity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_template_entity_type
    ADD CONSTRAINT document_template_entity_type_entity_type_id_fkey FOREIGN KEY (entity_type_id) REFERENCES public.entity_type(id) ON DELETE CASCADE;


--
-- Name: action_email_settings email_action_settings_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_email_settings
    ADD CONSTRAINT email_action_settings_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: action_email_settings email_action_settings_action_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_email_settings
    ADD CONSTRAINT email_action_settings_action_id_fkey FOREIGN KEY (action_id) REFERENCES public.action(id) ON DELETE CASCADE;


--
-- Name: action_email_settings email_action_settings_mailbox_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_email_settings
    ADD CONSTRAINT email_action_settings_mailbox_id_fkey FOREIGN KEY (mailbox_id) REFERENCES public.mailbox(id) ON DELETE CASCADE;


--
-- Name: action_email_settings email_action_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_email_settings
    ADD CONSTRAINT email_action_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: entity entity_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity
    ADD CONSTRAINT entity_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: entity entity_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity
    ADD CONSTRAINT entity_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: entity entity_entity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity
    ADD CONSTRAINT entity_entity_type_id_fkey FOREIGN KEY (entity_type_id) REFERENCES public.entity_type(id) ON DELETE CASCADE;


--
-- Name: entity_event entity_event_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_event
    ADD CONSTRAINT entity_event_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: entity_event entity_event_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_event
    ADD CONSTRAINT entity_event_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE CASCADE;


--
-- Name: entity_link entity_link_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_link
    ADD CONSTRAINT entity_link_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: entity_link entity_link_back_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_link
    ADD CONSTRAINT entity_link_back_link_id_fkey FOREIGN KEY (back_link_id) REFERENCES public.entity_link(id) ON DELETE CASCADE;


--
-- Name: entity_link entity_link_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_link
    ADD CONSTRAINT entity_link_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.entity(id) ON DELETE CASCADE;


--
-- Name: entity_link entity_link_target_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_link
    ADD CONSTRAINT entity_link_target_id_fkey FOREIGN KEY (target_id) REFERENCES public.entity(id) ON DELETE CASCADE;


--
-- Name: entity_list_settings entity_list_settings_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_list_settings
    ADD CONSTRAINT entity_list_settings_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: entity_list_settings entity_list_settings_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_list_settings
    ADD CONSTRAINT entity_list_settings_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.board(id) ON DELETE CASCADE;


--
-- Name: entity_list_settings entity_list_settings_entity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_list_settings
    ADD CONSTRAINT entity_list_settings_entity_type_id_fkey FOREIGN KEY (entity_type_id) REFERENCES public.entity_type(id) ON DELETE CASCADE;


--
-- Name: entity entity_responsible_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity
    ADD CONSTRAINT entity_responsible_user_id_fkey FOREIGN KEY (responsible_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: entity_stage_history entity_stage_history_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_stage_history
    ADD CONSTRAINT entity_stage_history_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: entity_stage_history entity_stage_history_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_stage_history
    ADD CONSTRAINT entity_stage_history_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.board(id) ON DELETE CASCADE;


--
-- Name: entity_stage_history entity_stage_history_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_stage_history
    ADD CONSTRAINT entity_stage_history_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE CASCADE;


--
-- Name: entity_stage_history entity_stage_history_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_stage_history
    ADD CONSTRAINT entity_stage_history_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.stage(id) ON DELETE CASCADE;


--
-- Name: entity entity_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity
    ADD CONSTRAINT entity_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.stage(id) ON DELETE CASCADE;


--
-- Name: entity_type entity_type_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_type
    ADD CONSTRAINT entity_type_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: entity_type_feature entity_type_feature_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_type_feature
    ADD CONSTRAINT entity_type_feature_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: entity_type_feature entity_type_feature_entity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_type_feature
    ADD CONSTRAINT entity_type_feature_entity_type_id_fkey FOREIGN KEY (entity_type_id) REFERENCES public.entity_type(id) ON DELETE CASCADE;


--
-- Name: entity_type_feature entity_type_feature_feature_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_type_feature
    ADD CONSTRAINT entity_type_feature_feature_id_fkey FOREIGN KEY (feature_id) REFERENCES public.feature(id) ON DELETE CASCADE;


--
-- Name: entity_type_link entity_type_link_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_type_link
    ADD CONSTRAINT entity_type_link_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: entity_type_link entity_type_link_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_type_link
    ADD CONSTRAINT entity_type_link_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.entity_type(id) ON DELETE CASCADE;


--
-- Name: entity_type_link entity_type_link_target_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_type_link
    ADD CONSTRAINT entity_type_link_target_id_fkey FOREIGN KEY (target_id) REFERENCES public.entity_type(id) ON DELETE CASCADE;


--
-- Name: exact_time_trigger_settings exact_time_trigger_settings_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exact_time_trigger_settings
    ADD CONSTRAINT exact_time_trigger_settings_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: exact_time_trigger_settings exact_time_trigger_settings_trigger_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exact_time_trigger_settings
    ADD CONSTRAINT exact_time_trigger_settings_trigger_id_fkey FOREIGN KEY (trigger_id) REFERENCES public.trigger(id) ON DELETE CASCADE;


--
-- Name: external_entity external_entity_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_entity
    ADD CONSTRAINT external_entity_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: external_entity external_entity_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_entity
    ADD CONSTRAINT external_entity_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE CASCADE;


--
-- Name: external_entity external_entity_system_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_entity
    ADD CONSTRAINT external_entity_system_fkey FOREIGN KEY (system) REFERENCES public.external_system(id);


--
-- Name: field field_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field
    ADD CONSTRAINT field_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: field_condition field_condition_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_condition
    ADD CONSTRAINT field_condition_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: field_condition field_condition_condition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_condition
    ADD CONSTRAINT field_condition_condition_id_fkey FOREIGN KEY (condition_id) REFERENCES public.condition(id) ON DELETE CASCADE;


--
-- Name: field_condition field_condition_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_condition
    ADD CONSTRAINT field_condition_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.field(id) ON DELETE CASCADE;


--
-- Name: field field_entity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field
    ADD CONSTRAINT field_entity_type_id_fkey FOREIGN KEY (entity_type_id) REFERENCES public.entity_type(id) ON DELETE CASCADE;


--
-- Name: field field_field_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field
    ADD CONSTRAINT field_field_group_id_fkey FOREIGN KEY (field_group_id) REFERENCES public.field_group(id) ON DELETE CASCADE;


--
-- Name: field_group field_group_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_group
    ADD CONSTRAINT field_group_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: field_group field_group_entity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_group
    ADD CONSTRAINT field_group_entity_type_id_fkey FOREIGN KEY (entity_type_id) REFERENCES public.entity_type(id) ON DELETE CASCADE;


--
-- Name: field_option field_option_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_option
    ADD CONSTRAINT field_option_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: field_option field_option_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_option
    ADD CONSTRAINT field_option_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.field(id) ON DELETE CASCADE;


--
-- Name: field_stage_settings field_stage_settings_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_stage_settings
    ADD CONSTRAINT field_stage_settings_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: field_stage_settings field_stage_settings_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_stage_settings
    ADD CONSTRAINT field_stage_settings_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.field(id) ON DELETE CASCADE;


--
-- Name: field_stage_settings field_stage_settings_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_stage_settings
    ADD CONSTRAINT field_stage_settings_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.stage(id) ON DELETE CASCADE;


--
-- Name: field_user_settings field_user_settings_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_user_settings
    ADD CONSTRAINT field_user_settings_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: field_user_settings field_user_settings_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_user_settings
    ADD CONSTRAINT field_user_settings_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.field(id) ON DELETE CASCADE;


--
-- Name: field_user_settings field_user_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_user_settings
    ADD CONSTRAINT field_user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: field_value field_value_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_value
    ADD CONSTRAINT field_value_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: field_value field_value_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_value
    ADD CONSTRAINT field_value_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE CASCADE;


--
-- Name: field_value field_value_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_value
    ADD CONSTRAINT field_value_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.field(id) ON DELETE CASCADE;


--
-- Name: file_info file_info_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_info
    ADD CONSTRAINT file_info_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: file_info file_info_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_info
    ADD CONSTRAINT file_info_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: file_link file_link_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_link
    ADD CONSTRAINT file_link_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: file_link file_link_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_link
    ADD CONSTRAINT file_link_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mail_message mail_message_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_message
    ADD CONSTRAINT mail_message_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: mail_message mail_message_contact_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_message
    ADD CONSTRAINT mail_message_contact_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE SET NULL;


--
-- Name: mail_message_folder mail_message_folder_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_message_folder
    ADD CONSTRAINT mail_message_folder_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.mailbox_folder(id) ON DELETE CASCADE;


--
-- Name: mail_message_folder mail_message_folder_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_message_folder
    ADD CONSTRAINT mail_message_folder_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.mail_message(id) ON DELETE CASCADE;


--
-- Name: mail_message mail_message_mailbox_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_message
    ADD CONSTRAINT mail_message_mailbox_id_fkey FOREIGN KEY (mailbox_id) REFERENCES public.mailbox(id) ON DELETE CASCADE;


--
-- Name: mail_message_payload mail_message_payload_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_message_payload
    ADD CONSTRAINT mail_message_payload_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: mail_message_payload mail_message_payload_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_message_payload
    ADD CONSTRAINT mail_message_payload_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.mail_message(id) ON DELETE CASCADE;


--
-- Name: mailbox_accessible_user mailbox_accessible_user_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_accessible_user
    ADD CONSTRAINT mailbox_accessible_user_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: mailbox_accessible_user mailbox_accessible_user_mailbox_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_accessible_user
    ADD CONSTRAINT mailbox_accessible_user_mailbox_id_fkey FOREIGN KEY (mailbox_id) REFERENCES public.mailbox(id) ON DELETE CASCADE;


--
-- Name: mailbox_accessible_user mailbox_accessible_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_accessible_user
    ADD CONSTRAINT mailbox_accessible_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mailbox mailbox_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox
    ADD CONSTRAINT mailbox_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: mailbox mailbox_contact_entity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox
    ADD CONSTRAINT mailbox_contact_entity_type_id_fkey FOREIGN KEY (contact_entity_type_id) REFERENCES public.entity_type(id) ON DELETE SET NULL;


--
-- Name: mailbox_folder mailbox_folder_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_folder
    ADD CONSTRAINT mailbox_folder_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: mailbox_folder mailbox_folder_mailbox_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_folder
    ADD CONSTRAINT mailbox_folder_mailbox_id_fkey FOREIGN KEY (mailbox_id) REFERENCES public.mailbox(id) ON DELETE CASCADE;


--
-- Name: mailbox mailbox_lead_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox
    ADD CONSTRAINT mailbox_lead_board_id_fkey FOREIGN KEY (lead_board_id) REFERENCES public.board(id) ON DELETE SET NULL;


--
-- Name: mailbox mailbox_lead_entity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox
    ADD CONSTRAINT mailbox_lead_entity_type_id_fkey FOREIGN KEY (lead_entity_type_id) REFERENCES public.entity_type(id) ON DELETE SET NULL;


--
-- Name: mailbox mailbox_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox
    ADD CONSTRAINT mailbox_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: mailbox_settings_gmail mailbox_settings_gmail_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_settings_gmail
    ADD CONSTRAINT mailbox_settings_gmail_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: mailbox_settings_gmail mailbox_settings_gmail_mailbox_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_settings_gmail
    ADD CONSTRAINT mailbox_settings_gmail_mailbox_id_fkey FOREIGN KEY (mailbox_id) REFERENCES public.mailbox(id) ON DELETE CASCADE;


--
-- Name: mailbox_settings_manual mailbox_settings_manual_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_settings_manual
    ADD CONSTRAINT mailbox_settings_manual_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: mailbox_settings_manual mailbox_settings_manual_mailbox_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_settings_manual
    ADD CONSTRAINT mailbox_settings_manual_mailbox_id_fkey FOREIGN KEY (mailbox_id) REFERENCES public.mailbox(id) ON DELETE CASCADE;


--
-- Name: mailbox_signature mailbox_signature_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_signature
    ADD CONSTRAINT mailbox_signature_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: mailbox_signature mailbox_signature_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_signature
    ADD CONSTRAINT mailbox_signature_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mailbox_signature_link mailbox_signature_link_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_signature_link
    ADD CONSTRAINT mailbox_signature_link_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: mailbox_signature_link mailbox_signature_link_mailbox_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_signature_link
    ADD CONSTRAINT mailbox_signature_link_mailbox_id_fkey FOREIGN KEY (mailbox_id) REFERENCES public.mailbox(id) ON DELETE CASCADE;


--
-- Name: mailbox_signature_link mailbox_signature_link_signature_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailbox_signature_link
    ADD CONSTRAINT mailbox_signature_link_signature_id_fkey FOREIGN KEY (signature_id) REFERENCES public.mailbox_signature(id) ON DELETE CASCADE;


--
-- Name: note note_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note
    ADD CONSTRAINT note_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: note note_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note
    ADD CONSTRAINT note_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: note note_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note
    ADD CONSTRAINT note_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE CASCADE;


--
-- Name: notification notification_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: notification notification_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE SET NULL;


--
-- Name: notification notification_from_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_from_user_fkey FOREIGN KEY (from_user) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notification_settings notification_settings_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: notification_settings notification_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notification_type_follow_user notification_type_follow_user_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_type_follow_user
    ADD CONSTRAINT notification_type_follow_user_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: notification_type_follow_user notification_type_follow_user_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_type_follow_user
    ADD CONSTRAINT notification_type_follow_user_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.notification_type_settings(id) ON DELETE CASCADE;


--
-- Name: notification_type_follow_user notification_type_follow_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_type_follow_user
    ADD CONSTRAINT notification_type_follow_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notification_type_settings notification_type_settings_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_type_settings
    ADD CONSTRAINT notification_type_settings_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: notification_type_settings notification_type_settings_settings_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_type_settings
    ADD CONSTRAINT notification_type_settings_settings_id_fkey FOREIGN KEY (settings_id) REFERENCES public.notification_settings(id) ON DELETE CASCADE;


--
-- Name: notification notification_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: object_permission object_permission_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.object_permission
    ADD CONSTRAINT object_permission_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: order_item order_item_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: order_item order_item_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_item order_item_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id);


--
-- Name: order_status order_status_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status
    ADD CONSTRAINT order_status_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: orders orders_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: orders orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: orders orders_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE CASCADE;


--
-- Name: orders orders_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.products_section(id) ON DELETE CASCADE;


--
-- Name: orders orders_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.order_status(id);


--
-- Name: orders orders_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouse(id);


--
-- Name: product product_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: product_category product_category_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_category
    ADD CONSTRAINT product_category_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: product_category product_category_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_category
    ADD CONSTRAINT product_category_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: product product_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_category(id) ON DELETE SET NULL;


--
-- Name: product_category product_category_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_category
    ADD CONSTRAINT product_category_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.product_category(id);


--
-- Name: product_category product_category_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_category
    ADD CONSTRAINT product_category_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.products_section(id) ON DELETE CASCADE;


--
-- Name: product product_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: products_section product_module_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_section
    ADD CONSTRAINT product_module_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: product_price product_price_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_price
    ADD CONSTRAINT product_price_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: product_price product_price_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_price
    ADD CONSTRAINT product_price_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id) ON DELETE CASCADE;


--
-- Name: product product_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.products_section(id) ON DELETE CASCADE;


--
-- Name: products_section_entity_type products_section_entity_type_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_section_entity_type
    ADD CONSTRAINT products_section_entity_type_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: products_section_entity_type products_section_entity_type_entity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_section_entity_type
    ADD CONSTRAINT products_section_entity_type_entity_type_id_fkey FOREIGN KEY (entity_type_id) REFERENCES public.entity_type(id) ON DELETE CASCADE;


--
-- Name: products_section_entity_type products_section_entity_type_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_section_entity_type
    ADD CONSTRAINT products_section_entity_type_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.products_section(id) ON DELETE CASCADE;


--
-- Name: ready_made_solution ready_made_solution_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ready_made_solution
    ADD CONSTRAINT ready_made_solution_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id);


--
-- Name: ready_made_solution ready_made_solution_industry_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ready_made_solution
    ADD CONSTRAINT ready_made_solution_industry_code_fkey FOREIGN KEY (industry_code) REFERENCES public.industry(code);


--
-- Name: rental_interval rental_interval_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_interval
    ADD CONSTRAINT rental_interval_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: rental_interval rental_interval_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_interval
    ADD CONSTRAINT rental_interval_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.products_section(id) ON DELETE CASCADE;


--
-- Name: rental_order rental_order_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_order
    ADD CONSTRAINT rental_order_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: rental_order rental_order_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_order
    ADD CONSTRAINT rental_order_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: rental_order rental_order_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_order
    ADD CONSTRAINT rental_order_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE CASCADE;


--
-- Name: rental_order_item rental_order_item_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_order_item
    ADD CONSTRAINT rental_order_item_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: rental_order_item rental_order_item_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_order_item
    ADD CONSTRAINT rental_order_item_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.rental_order(id) ON DELETE CASCADE;


--
-- Name: rental_order_item rental_order_item_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_order_item
    ADD CONSTRAINT rental_order_item_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id) ON DELETE CASCADE;


--
-- Name: rental_order_period rental_order_period_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_order_period
    ADD CONSTRAINT rental_order_period_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: rental_order_period rental_order_period_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_order_period
    ADD CONSTRAINT rental_order_period_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.rental_order(id) ON DELETE CASCADE;


--
-- Name: rental_order rental_order_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_order
    ADD CONSTRAINT rental_order_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.products_section(id) ON DELETE CASCADE;


--
-- Name: rental_order rental_order_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_order
    ADD CONSTRAINT rental_order_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouse(id);


--
-- Name: rental_event rental_schedule_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_event
    ADD CONSTRAINT rental_schedule_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: rental_event rental_schedule_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_event
    ADD CONSTRAINT rental_schedule_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.rental_order_item(id) ON DELETE CASCADE;


--
-- Name: rental_event rental_schedule_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_event
    ADD CONSTRAINT rental_schedule_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id) ON DELETE CASCADE;


--
-- Name: rental_event rental_schedule_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_event
    ADD CONSTRAINT rental_schedule_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.products_section(id) ON DELETE CASCADE;


--
-- Name: reservation reservation_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: reservation reservation_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: reservation reservation_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_item(id) ON DELETE CASCADE;


--
-- Name: reservation reservation_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id);


--
-- Name: reservation reservation_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouse(id);


--
-- Name: sales_plan sales_plan_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_plan
    ADD CONSTRAINT sales_plan_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: sales_plan sales_plan_entity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_plan
    ADD CONSTRAINT sales_plan_entity_type_id_fkey FOREIGN KEY (entity_type_id) REFERENCES public.entity_type(id) ON DELETE CASCADE;


--
-- Name: sales_plan sales_plan_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_plan
    ADD CONSTRAINT sales_plan_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: salesforce_settings salesforce_settings_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salesforce_settings
    ADD CONSTRAINT salesforce_settings_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: schedule schedule_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT schedule_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: schedule_appointment schedule_appointment_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_appointment
    ADD CONSTRAINT schedule_appointment_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: schedule_appointment schedule_appointment_performer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_appointment
    ADD CONSTRAINT schedule_appointment_performer_id_fkey FOREIGN KEY (performer_id) REFERENCES public.schedule_performer(id) ON DELETE CASCADE;


--
-- Name: schedule schedule_entity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT schedule_entity_type_id_fkey FOREIGN KEY (entity_type_id) REFERENCES public.entity_type(id) ON DELETE SET NULL;


--
-- Name: schedule_appointment schedule_event_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_appointment
    ADD CONSTRAINT schedule_event_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: schedule_appointment schedule_event_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_appointment
    ADD CONSTRAINT schedule_event_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE SET NULL;


--
-- Name: schedule_appointment schedule_event_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_appointment
    ADD CONSTRAINT schedule_event_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: schedule_appointment schedule_event_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_appointment
    ADD CONSTRAINT schedule_event_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedule(id) ON DELETE CASCADE;


--
-- Name: schedule_performer schedule_performer_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_performer
    ADD CONSTRAINT schedule_performer_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: schedule_performer schedule_performer_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_performer
    ADD CONSTRAINT schedule_performer_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department(id) ON DELETE CASCADE;


--
-- Name: schedule_performer schedule_performer_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_performer
    ADD CONSTRAINT schedule_performer_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedule(id) ON DELETE CASCADE;


--
-- Name: schedule_performer schedule_performer_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_performer
    ADD CONSTRAINT schedule_performer_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: schedule schedule_products_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT schedule_products_section_id_fkey FOREIGN KEY (products_section_id) REFERENCES public.products_section(id) ON DELETE SET NULL;


--
-- Name: action_scheduled scheduled_action_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_scheduled
    ADD CONSTRAINT scheduled_action_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: action_scheduled scheduled_action_action_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_scheduled
    ADD CONSTRAINT scheduled_action_action_id_fkey FOREIGN KEY (action_id) REFERENCES public.action(id) ON DELETE CASCADE;


--
-- Name: action_scheduled scheduled_action_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_scheduled
    ADD CONSTRAINT scheduled_action_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: action_scheduled scheduled_action_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_scheduled
    ADD CONSTRAINT scheduled_action_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE CASCADE;


--
-- Name: scheduled_mail_message scheduled_mail_message_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_mail_message
    ADD CONSTRAINT scheduled_mail_message_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: scheduled_mail_message scheduled_mail_message_action_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_mail_message
    ADD CONSTRAINT scheduled_mail_message_action_id_fkey FOREIGN KEY (action_id) REFERENCES public.action(id) ON DELETE SET NULL;


--
-- Name: scheduled_mail_message scheduled_mail_message_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_mail_message
    ADD CONSTRAINT scheduled_mail_message_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE SET NULL;


--
-- Name: scheduled_mail_message scheduled_mail_message_mailbox_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_mail_message
    ADD CONSTRAINT scheduled_mail_message_mailbox_id_fkey FOREIGN KEY (mailbox_id) REFERENCES public.mailbox(id) ON DELETE CASCADE;


--
-- Name: scheduled_mail_message scheduled_mail_message_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_mail_message
    ADD CONSTRAINT scheduled_mail_message_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: shipment shipment_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipment
    ADD CONSTRAINT shipment_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: shipment shipment_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipment
    ADD CONSTRAINT shipment_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE CASCADE;


--
-- Name: shipment_item shipment_item_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipment_item
    ADD CONSTRAINT shipment_item_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: shipment_item shipment_item_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipment_item
    ADD CONSTRAINT shipment_item_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id);


--
-- Name: shipment_item shipment_item_shipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipment_item
    ADD CONSTRAINT shipment_item_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipment(id) ON DELETE CASCADE;


--
-- Name: shipment shipment_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipment
    ADD CONSTRAINT shipment_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: shipment shipment_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipment
    ADD CONSTRAINT shipment_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.products_section(id) ON DELETE CASCADE;


--
-- Name: shipment shipment_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipment
    ADD CONSTRAINT shipment_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.order_status(id);


--
-- Name: shipment shipment_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipment
    ADD CONSTRAINT shipment_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouse(id) ON DELETE CASCADE;


--
-- Name: site_form site_form_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form
    ADD CONSTRAINT site_form_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: site_form_consent site_form_consent_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_consent
    ADD CONSTRAINT site_form_consent_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: site_form_consent site_form_consent_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_consent
    ADD CONSTRAINT site_form_consent_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.site_form(id) ON DELETE CASCADE;


--
-- Name: site_form site_form_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form
    ADD CONSTRAINT site_form_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: site_form_entity_type site_form_entity_type_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_entity_type
    ADD CONSTRAINT site_form_entity_type_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: site_form_entity_type site_form_entity_type_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_entity_type
    ADD CONSTRAINT site_form_entity_type_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.board(id) ON DELETE SET NULL;


--
-- Name: site_form_entity_type site_form_entity_type_entity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_entity_type
    ADD CONSTRAINT site_form_entity_type_entity_type_id_fkey FOREIGN KEY (entity_type_id) REFERENCES public.entity_type(id) ON DELETE CASCADE;


--
-- Name: site_form_entity_type site_form_entity_type_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_entity_type
    ADD CONSTRAINT site_form_entity_type_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.site_form(id) ON DELETE CASCADE;


--
-- Name: site_form_field site_form_field_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_field
    ADD CONSTRAINT site_form_field_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: site_form_field_entity_field site_form_field_entity_field_entity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_field_entity_field
    ADD CONSTRAINT site_form_field_entity_field_entity_type_id_fkey FOREIGN KEY (entity_type_id) REFERENCES public.entity_type(id) ON DELETE CASCADE;


--
-- Name: site_form_field_entity_field site_form_field_entity_field_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_field_entity_field
    ADD CONSTRAINT site_form_field_entity_field_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.field(id) ON DELETE CASCADE;


--
-- Name: site_form_field_entity_field site_form_field_entity_field_form_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_field_entity_field
    ADD CONSTRAINT site_form_field_entity_field_form_field_id_fkey FOREIGN KEY (form_field_id) REFERENCES public.site_form_field(id) ON DELETE CASCADE;


--
-- Name: site_form_field_entity_name site_form_field_entity_name_entity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_field_entity_name
    ADD CONSTRAINT site_form_field_entity_name_entity_type_id_fkey FOREIGN KEY (entity_type_id) REFERENCES public.entity_type(id) ON DELETE CASCADE;


--
-- Name: site_form_field_entity_name site_form_field_entity_name_form_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_field_entity_name
    ADD CONSTRAINT site_form_field_entity_name_form_field_id_fkey FOREIGN KEY (form_field_id) REFERENCES public.site_form_field(id) ON DELETE CASCADE;


--
-- Name: site_form_field site_form_field_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_field
    ADD CONSTRAINT site_form_field_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.site_form_page(id) ON DELETE CASCADE;


--
-- Name: site_form_gratitude site_form_gratitude_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_gratitude
    ADD CONSTRAINT site_form_gratitude_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: site_form_gratitude site_form_gratitude_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_gratitude
    ADD CONSTRAINT site_form_gratitude_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.site_form(id) ON DELETE CASCADE;


--
-- Name: site_form_page site_form_page_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_page
    ADD CONSTRAINT site_form_page_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: site_form_page site_form_page_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form_page
    ADD CONSTRAINT site_form_page_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.site_form(id) ON DELETE CASCADE;


--
-- Name: site_form site_form_responsible_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_form
    ADD CONSTRAINT site_form_responsible_id_fkey FOREIGN KEY (responsible_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: stage stage_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage
    ADD CONSTRAINT stage_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: stage stage_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage
    ADD CONSTRAINT stage_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.board(id) ON DELETE CASCADE;


--
-- Name: product_stock stock_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_stock
    ADD CONSTRAINT stock_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: product_stock stock_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_stock
    ADD CONSTRAINT stock_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id) ON DELETE CASCADE;


--
-- Name: product_stock stock_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_stock
    ADD CONSTRAINT stock_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouse(id) ON DELETE CASCADE;


--
-- Name: account_subscription subscription_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_subscription
    ADD CONSTRAINT subscription_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: task_subtask subtask_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_subtask
    ADD CONSTRAINT subtask_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: task_subtask subtask_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_subtask
    ADD CONSTRAINT subtask_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.task(id) ON DELETE CASCADE;


--
-- Name: task task_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: action_task_settings task_action_settings_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_task_settings
    ADD CONSTRAINT task_action_settings_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: action_task_settings task_action_settings_action_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_task_settings
    ADD CONSTRAINT task_action_settings_action_id_fkey FOREIGN KEY (action_id) REFERENCES public.action(id) ON DELETE CASCADE;


--
-- Name: action_task_settings task_action_settings_responsible_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_task_settings
    ADD CONSTRAINT task_action_settings_responsible_user_id_fkey FOREIGN KEY (responsible_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: task task_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.board(id) ON DELETE CASCADE;


--
-- Name: task_comment task_comment_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comment
    ADD CONSTRAINT task_comment_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: task_comment task_comment_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comment
    ADD CONSTRAINT task_comment_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: task_comment_like task_comment_like_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comment_like
    ADD CONSTRAINT task_comment_like_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: task_comment_like task_comment_like_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comment_like
    ADD CONSTRAINT task_comment_like_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.task_comment(id) ON DELETE CASCADE;


--
-- Name: task_comment_like task_comment_like_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comment_like
    ADD CONSTRAINT task_comment_like_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: task_comment task_comment_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comment
    ADD CONSTRAINT task_comment_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.task(id) ON DELETE CASCADE;


--
-- Name: task task_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: task task_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE CASCADE;


--
-- Name: task task_responsible_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_responsible_user_id_fkey FOREIGN KEY (responsible_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: task_settings task_settings_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_settings
    ADD CONSTRAINT task_settings_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: task task_settings_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_settings_id_fkey FOREIGN KEY (settings_id) REFERENCES public.task_settings(id) ON DELETE SET NULL;


--
-- Name: task task_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.stage(id) ON DELETE CASCADE;


--
-- Name: activity_type task_type_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_type
    ADD CONSTRAINT task_type_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: test_account test_account_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_account
    ADD CONSTRAINT test_account_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: trigger trigger_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trigger
    ADD CONSTRAINT trigger_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: tutorial_group tutorial_group_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_group
    ADD CONSTRAINT tutorial_group_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: tutorial_item tutorial_item_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_item
    ADD CONSTRAINT tutorial_item_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: tutorial_item tutorial_item_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_item
    ADD CONSTRAINT tutorial_item_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.tutorial_group(id) ON DELETE CASCADE;


--
-- Name: tutorial_item_product tutorial_item_product_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_item_product
    ADD CONSTRAINT tutorial_item_product_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: tutorial_item_product tutorial_item_product_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_item_product
    ADD CONSTRAINT tutorial_item_product_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.tutorial_item(id) ON DELETE CASCADE;


--
-- Name: tutorial_item_user tutorial_item_user_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_item_user
    ADD CONSTRAINT tutorial_item_user_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.tutorial_item(id) ON DELETE CASCADE;


--
-- Name: tutorial_item_user tutorial_item_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_item_user
    ADD CONSTRAINT tutorial_item_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_condition user_condition_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_condition
    ADD CONSTRAINT user_condition_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: user_condition user_condition_condition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_condition
    ADD CONSTRAINT user_condition_condition_id_fkey FOREIGN KEY (condition_id) REFERENCES public.condition(id) ON DELETE CASCADE;


--
-- Name: user_condition user_condition_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_condition
    ADD CONSTRAINT user_condition_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_object_permission user_object_permission_object_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_object_permission
    ADD CONSTRAINT user_object_permission_object_permission_id_fkey FOREIGN KEY (object_permission_id) REFERENCES public.object_permission(id) ON DELETE CASCADE;


--
-- Name: user_object_permission user_object_permission_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_object_permission
    ADD CONSTRAINT user_object_permission_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_profile user_profile_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: user_profile user_profile_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department(id);


--
-- Name: voximplant_account voximplant_account_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_account
    ADD CONSTRAINT voximplant_account_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: voximplant_call voximplant_call_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_call
    ADD CONSTRAINT voximplant_call_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: voximplant_call voximplant_call_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_call
    ADD CONSTRAINT voximplant_call_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE SET NULL;


--
-- Name: voximplant_call voximplant_call_number_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_call
    ADD CONSTRAINT voximplant_call_number_id_fkey FOREIGN KEY (number_id) REFERENCES public.voximplant_number(id) ON DELETE SET NULL;


--
-- Name: voximplant_call voximplant_call_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_call
    ADD CONSTRAINT voximplant_call_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: voximplant_number voximplant_number_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_number
    ADD CONSTRAINT voximplant_number_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: voximplant_number_user voximplant_number_user_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_number_user
    ADD CONSTRAINT voximplant_number_user_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: voximplant_number_user voximplant_number_user_number_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_number_user
    ADD CONSTRAINT voximplant_number_user_number_id_fkey FOREIGN KEY (number_id) REFERENCES public.voximplant_number(id) ON DELETE CASCADE;


--
-- Name: voximplant_number_user voximplant_number_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_number_user
    ADD CONSTRAINT voximplant_number_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: voximplant_scenario_entity voximplant_scenario_entity_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_scenario_entity
    ADD CONSTRAINT voximplant_scenario_entity_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: voximplant_scenario_entity voximplant_scenario_entity_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_scenario_entity
    ADD CONSTRAINT voximplant_scenario_entity_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.board(id) ON DELETE CASCADE;


--
-- Name: voximplant_scenario_entity voximplant_scenario_entity_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_scenario_entity
    ADD CONSTRAINT voximplant_scenario_entity_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.entity_type(id) ON DELETE CASCADE;


--
-- Name: voximplant_scenario_entity voximplant_scenario_entity_deal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_scenario_entity
    ADD CONSTRAINT voximplant_scenario_entity_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.entity_type(id) ON DELETE CASCADE;


--
-- Name: voximplant_scenario_entity voximplant_scenario_entity_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_scenario_entity
    ADD CONSTRAINT voximplant_scenario_entity_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: voximplant_scenario_note voximplant_scenario_note_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_scenario_note
    ADD CONSTRAINT voximplant_scenario_note_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: voximplant_scenario_task voximplant_scenario_task_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_scenario_task
    ADD CONSTRAINT voximplant_scenario_task_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: voximplant_scenario_task voximplant_scenario_task_activity_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_scenario_task
    ADD CONSTRAINT voximplant_scenario_task_activity_owner_id_fkey FOREIGN KEY (activity_owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: voximplant_scenario_task voximplant_scenario_task_activity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_scenario_task
    ADD CONSTRAINT voximplant_scenario_task_activity_type_id_fkey FOREIGN KEY (activity_type_id) REFERENCES public.activity_type(id) ON DELETE CASCADE;


--
-- Name: voximplant_scenario_task voximplant_scenario_task_task_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_scenario_task
    ADD CONSTRAINT voximplant_scenario_task_task_owner_id_fkey FOREIGN KEY (task_owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: voximplant_user voximplant_user_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_user
    ADD CONSTRAINT voximplant_user_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: voximplant_user voximplant_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voximplant_user
    ADD CONSTRAINT voximplant_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: warehouse warehouse_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse
    ADD CONSTRAINT warehouse_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: warehouse warehouse_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse
    ADD CONSTRAINT warehouse_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: warehouse warehouse_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse
    ADD CONSTRAINT warehouse_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.products_section(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

