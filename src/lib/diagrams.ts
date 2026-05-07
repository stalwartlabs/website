// Registry mapping diagram IDs (referenced from YAML) to Astro components.
// Add new diagrams by importing the component and registering its ID here.

import ArchitectureDiagram from "../components/ArchitectureDiagram.astro";
import ClusterDiagram from "../components/ClusterDiagram.astro";
import SmtpPipelineDiagram from "../components/SmtpPipelineDiagram.astro";
import LlmDecisionDiagram from "../components/LlmDecisionDiagram.astro";
import SecurityStackDiagram from "../components/SecurityStackDiagram.astro";
import AcmeLifecycleDiagram from "../components/AcmeLifecycleDiagram.astro";
import ImapClientGridDiagram from "../components/ImapClientGridDiagram.astro";
import DnsRecordsTileDiagram from "../components/DnsRecordsTileDiagram.astro";
import AutoconfigDiagram from "../components/AutoconfigDiagram.astro";
import ClassifierDiagram from "../components/ClassifierDiagram.astro";
import PhishingAxesDiagram from "../components/PhishingAxesDiagram.astro";
import DnsblFanInDiagram from "../components/DnsblFanInDiagram.astro";
import AutoBanGaugesDiagram from "../components/AutoBanGaugesDiagram.astro";
import EnvelopeRewriteDiagram from "../components/EnvelopeRewriteDiagram.astro";
import ItipImipDiagram from "../components/ItipImipDiagram.astro";
import ContactsSyncDiagram from "../components/ContactsSyncDiagram.astro";
import ValarmEmailDiagram from "../components/ValarmEmailDiagram.astro";
import ReadReplicasDiagram from "../components/ReadReplicasDiagram.astro";
import MigrationFlowDiagram from "../components/MigrationFlowDiagram.astro";
import CollabUnifiedDiagram from "../components/CollabUnifiedDiagram.astro";
import AiByomDiagram from "../components/AiByomDiagram.astro";
import SenderReputationMock from "../components/SenderReputationMock.astro";
import CalendarGridMock from "../components/CalendarGridMock.astro";
import FileBrowserMock from "../components/FileBrowserMock.astro";
import TenantsListMock from "../components/TenantsListMock.astro";
import BrandingMock from "../components/BrandingMock.astro";

export const diagrams: Record<string, any> = {
  architecture: ArchitectureDiagram,
  cluster: ClusterDiagram,
  "smtp-pipeline": SmtpPipelineDiagram,
  "llm-decision": LlmDecisionDiagram,
  "security-stack": SecurityStackDiagram,
  "acme-lifecycle": AcmeLifecycleDiagram,
  "imap-client-grid": ImapClientGridDiagram,
  "dns-records-tile": DnsRecordsTileDiagram,
  autoconfig: AutoconfigDiagram,
  classifier: ClassifierDiagram,
  "phishing-axes": PhishingAxesDiagram,
  "dnsbl-fan-in": DnsblFanInDiagram,
  "auto-ban-gauges": AutoBanGaugesDiagram,
  "envelope-rewrite": EnvelopeRewriteDiagram,
  "itip-imip": ItipImipDiagram,
  "contacts-sync": ContactsSyncDiagram,
  "valarm-email": ValarmEmailDiagram,
  "read-replicas": ReadReplicasDiagram,
  migration: MigrationFlowDiagram,
  "collab-unified": CollabUnifiedDiagram,
  "ai-byom": AiByomDiagram,
  "sender-reputation": SenderReputationMock,
  "calendar-grid": CalendarGridMock,
  "file-browser": FileBrowserMock,
  "tenants-list": TenantsListMock,
  branding: BrandingMock,
};
