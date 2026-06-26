import { JSX } from "preact"

// Minimal local type definitions — avoids external @quartz-community/types dependency
interface FrontmatterData {
  title?: string
  tags?: string | string[]
  wordnet?: {
    term?: string
    definitions?: string[]
    synonyms?: string[]
    related_forms?: string[]
  }
  classification?: {
    layer?: string | string[]
    stage?: string | string[]
    scale?: string | string[]
    concern_type?: string | string[]
    evaluator?: string | string[]
    determinism?: string
    writing_stage?: string | string[]
    address_when?: string
    engineering_stage?: string | string[]
    impact?: string | string[]
    risk_severity?: string
    responsible_role?: string | string[]
    audience_sensitivity?: string | string[]
    [key: string]: string | string[] | undefined
  }
  relationships?: Record<string, string | string[]>
  [key: string]: unknown
}

interface QuartzComponentProps {
  fileData: {
    frontmatter?: FrontmatterData
    slug?: string
    [key: string]: unknown
  }
  cfg: { baseUrl?: string }
  displayClass?: "mobile-only" | "desktop-only"
  [key: string]: unknown
}

type QuartzComponent = ((props: QuartzComponentProps) => JSX.Element | null) & {
  css?: string
  beforeDOMLoaded?: string
  afterDOMLoaded?: string
  displayName?: string
}

type QuartzComponentConstructor = (opts?: Record<string, unknown>) => QuartzComponent

// ── Helpers ──────────────────────────────────────────────────────────────────

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

function labelify(s: string): string {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function pathToRoot(slug: string): string {
  const depth = (slug.match(/\//g) ?? []).length
  return depth === 0 ? "." : Array(depth).fill("..").join("/")
}

// ── Dimension display labels (D1–D13) ─────────────────────────────────────────

const DIMENSION_LABELS: Record<string, string> = {
  layer: "Layer (D1)",
  stage: "Stage (D2)",
  scale: "Scale (D3)",
  concern_type: "Concern Type (D4)",
  evaluator: "Evaluator (D5)",
  determinism: "Determinism (D6)",
  writing_stage: "Writing Stage (D7)",
  address_when: "Address When (D8)",
  engineering_stage: "Engineering Stage (D9)",
  impact: "Impact (D10)",
  risk_severity: "Risk Severity (D11)",
  responsible_role: "Responsible Role (D12)",
  audience_sensitivity: "Audience Sensitivity (D13)",
}

// ── Relationship type display labels ─────────────────────────────────────────

const REL_LABELS: Record<string, string> = {
  subtype_of: "Subtype of",
  aspect_of: "Aspect of",
  impediment_to: "Impediment to",
  controlled_by: "Controlled by",
  increases_risk_of: "Increases risk of",
  prerequisite_for: "Prerequisite for",
  related_to: "Related to",
  commonly_confused_with: "Commonly confused with",
  mitigated_by: "Mitigated by",
  overlaps_with: "Overlaps with",
  part_of: "Part of",
  addressed_by: "Addressed by",
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const css = `
.wqo-concept {
  margin-top: 2rem;
  border-top: 1px solid var(--lightgray);
  padding-top: 1.5rem;
}
.wqo-section {
  margin-bottom: 1.75rem;
}
.wqo-section-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--gray);
  margin-bottom: 0.6rem;
}
.wqo-wordnet-def {
  font-size: 0.9rem;
  color: var(--darkgray);
  font-style: italic;
  margin-bottom: 0.2rem;
}
.wqo-wordnet-meta {
  font-size: 0.8rem;
  color: var(--gray);
  margin-top: 0.25rem;
}
.wqo-dim-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: baseline;
  margin-bottom: 0.35rem;
}
.wqo-dim-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--gray);
  min-width: 10rem;
  flex-shrink: 0;
}
.wqo-chip {
  display: inline-block;
  font-size: 0.72rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: var(--highlight);
  color: var(--darkgray);
  white-space: nowrap;
}
.wqo-rel-section {
  margin-bottom: 0.8rem;
}
.wqo-rel-type {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--secondary);
  margin-bottom: 0.2rem;
}
.wqo-rel-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.88rem;
}
.wqo-graph {
  width: 100%;
  height: 320px;
  border: 1px solid var(--lightgray);
  border-radius: 4px;
  background: var(--light);
}
`

// ── Client-side scripts ───────────────────────────────────────────────────────

const beforeDOMLoaded = `
(function() {
  if (window.__cytoscapeScript) return;
  window.__cytoscapeScript = true;
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.30.2/cytoscape.min.js';
  s.integrity = 'sha512-OZBpCsKFSJfm5HQoWqQqIVdGmm/U+uWJr/0qlkTMLJGHjhh5UEFz1Y3TzUKTXFQDFAWz0tlGXAjY0kDcaAIg==';
  s.crossOrigin = 'anonymous';
  document.head.appendChild(s);
})();
`

const afterDOMLoaded = `
(function() {
  var palette = ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#a65628','#f781bf','#888888'];

  function initGraphs() {
    document.querySelectorAll('.wqo-graph[data-relationships]').forEach(function(el) {
      if (el._wqoCy) { try { el._wqoCy.destroy(); } catch(e) {} el._wqoCy = null; }
      var raw = el.getAttribute('data-relationships');
      if (!raw) return;
      var data;
      try { data = JSON.parse(raw); } catch(e) { return; }
      if (!data.rels || Object.keys(data.rels).length === 0) return;

      var colorMap = {};
      var colorIdx = 0;
      var elements = [{ data: { id: data.id, label: data.name, current: true } }];

      Object.keys(data.rels).forEach(function(relType) {
        if (!colorMap[relType]) colorMap[relType] = palette[colorIdx++ % palette.length];
        var targets = data.rels[relType];
        if (!Array.isArray(targets)) targets = [targets];
        targets.forEach(function(t) {
          var exists = elements.some(function(e) { return e.data && e.data.id === t; });
          if (!exists) elements.push({ data: { id: t, label: t.replace(/-/g, ' ') } });
          elements.push({
            data: {
              id: data.id + '__' + relType + '__' + t,
              source: data.id,
              target: t,
              relType: relType,
              color: colorMap[relType]
            }
          });
        });
      });

      var cy = cytoscape({
        container: el,
        elements: elements,
        style: [
          {
            selector: 'node',
            style: {
              label: 'data(label)',
              'background-color': '#aaaaaa',
              color: '#333',
              'font-size': 11,
              'text-wrap': 'wrap',
              'text-max-width': '80px',
              'text-valign': 'bottom',
              'text-margin-y': 5
            }
          },
          {
            selector: 'node[?current]',
            style: {
              'background-color': '#284b63',
              color: '#fff',
              'font-weight': 'bold',
              'font-size': 12
            }
          },
          {
            selector: 'edge',
            style: {
              label: 'data(relType)',
              'line-color': 'data(color)',
              'target-arrow-color': 'data(color)',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'font-size': 9,
              color: '#555',
              'text-rotation': 'autorotate',
              'text-margin-y': -8
            }
          }
        ],
        layout: { name: 'cose', padding: 30, animate: false }
      });

      var basePath = (document.body.getAttribute('data-basepath') || '').replace(/\\/+$/, '');
      cy.on('tap', 'node', function(evt) {
        var id = evt.target.id();
        if (id !== data.id) window.location = basePath + '/lexicon/' + (data.subfolder || '') + id;
      });
      el._wqoCy = cy;
    });
  }

  function tryInit() {
    if (typeof cytoscape !== 'undefined') {
      initGraphs();
    } else {
      var attempts = 0;
      var t = setInterval(function() {
        if (typeof cytoscape !== 'undefined') {
          clearInterval(t);
          initGraphs();
        } else if (++attempts > 40) {
          clearInterval(t);
        }
      }, 100);
    }
  }

  document.addEventListener('nav', tryInit);
  tryInit();
})();
`

// ── Component ─────────────────────────────────────────────────────────────────

const WqoConceptView: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const fm = fileData.frontmatter
    if (!fm) return null
    if (!toArray(fm.tags as string | string[]).includes("lexicon")) return null

    const slug = (fileData.slug ?? "") as string
    const root = pathToRoot(slug)
    const slugParts = slug.split("/")
    const lexiconIdx = slugParts.indexOf("lexicon")
    const subfolder = lexiconIdx >= 0 && slugParts.length > lexiconIdx + 2
      ? slugParts[lexiconIdx + 1] + "/"
      : ""

    // WordNet block
    const wn = fm.wordnet
    const wordnetSection = wn ? (
      <div class="wqo-section">
        <div class="wqo-section-title">Definitions</div>
        {toArray(wn.definitions).map((d, i) => (
          <div key={i} class="wqo-wordnet-def">"{d}"</div>
        ))}
        {wn.synonyms && wn.synonyms.length > 0 && (
          <div class="wqo-wordnet-meta">
            <strong>Also known as:</strong> {toArray(wn.synonyms).join(", ")}
          </div>
        )}
        {wn.related_forms && wn.related_forms.length > 0 && (
          <div class="wqo-wordnet-meta">
            <strong>Related forms:</strong> {toArray(wn.related_forms).join(", ")}
          </div>
        )}
      </div>
    ) : null

    // Classification dimensions
    const cl = fm.classification
    const dimSection = cl ? (
      <div class="wqo-section">
        <div class="wqo-section-title">Classification</div>
        {Object.entries(DIMENSION_LABELS).map(([key, label]) => {
          const val = cl[key]
          if (!val) return null
          const chips = toArray(val)
          return (
            <div key={key} class="wqo-dim-group">
              <span class="wqo-dim-label">{label}</span>
              {chips.map((c, i) => (
                <span key={i} class="wqo-chip">{labelify(c)}</span>
              ))}
            </div>
          )
        })}
      </div>
    ) : null

    // Typed relationship list
    const rels = fm.relationships
    const relsSection =
      rels && Object.keys(rels).length > 0 ? (
        <div class="wqo-section">
          <div class="wqo-section-title">Relationships</div>
          {Object.entries(rels).map(([relType, targets]) => {
            const links = toArray(targets)
            return (
              <div key={relType} class="wqo-rel-section">
                <div class="wqo-rel-type">{REL_LABELS[relType] ?? labelify(relType)}</div>
                <div class="wqo-rel-links">
                  {links.map((t, i) => (
                    <a key={i} href={`${root}/lexicon/${subfolder}${t}`}>
                      {labelify(t)}
                    </a>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : null

    // Cytoscape graph — data embedded as JSON attribute, initialized client-side
    const conceptId = slug.split("/").pop() ?? slug
    const graphData =
      rels && Object.keys(rels).length > 0
        ? JSON.stringify({ id: conceptId, name: fm.title ?? conceptId, rels, subfolder })
        : null

    const graphSection = graphData ? (
      <div class="wqo-section">
        <div class="wqo-section-title">Concept Graph</div>
        <div class="wqo-graph" data-relationships={graphData} />
      </div>
    ) : null

    return (
      <div class="wqo-concept">
        {wordnetSection}
        {dimSection}
        {relsSection}
        {graphSection}
      </div>
    )
  }

  Component.css = css
  Component.beforeDOMLoaded = beforeDOMLoaded
  Component.afterDOMLoaded = afterDOMLoaded
  Component.displayName = "WqoConceptView"

  return Component
}

export { WqoConceptView }
export default WqoConceptView
