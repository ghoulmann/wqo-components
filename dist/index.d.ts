import { JSX } from 'preact';

interface FrontmatterData {
    title?: string;
    tags?: string | string[];
    wordnet?: {
        term?: string;
        definitions?: string[];
        synonyms?: string[];
        related_forms?: string[];
    };
    classification?: {
        layer?: string | string[];
        stage?: string | string[];
        scale?: string | string[];
        concern_type?: string | string[];
        evaluator?: string | string[];
        determinism?: string;
        writing_stage?: string | string[];
        address_when?: string;
        engineering_stage?: string | string[];
        impact?: string | string[];
        risk_severity?: string;
        responsible_role?: string | string[];
        audience_sensitivity?: string | string[];
        [key: string]: string | string[] | undefined;
    };
    relationships?: Record<string, string | string[]>;
    [key: string]: unknown;
}
interface QuartzComponentProps {
    fileData: {
        frontmatter?: FrontmatterData;
        slug?: string;
        [key: string]: unknown;
    };
    cfg: {
        baseUrl?: string;
    };
    displayClass?: "mobile-only" | "desktop-only";
    [key: string]: unknown;
}
type QuartzComponent = ((props: QuartzComponentProps) => JSX.Element | null) & {
    css?: string;
    beforeDOMLoaded?: string;
    afterDOMLoaded?: string;
    displayName?: string;
};
type QuartzComponentConstructor = (opts?: Record<string, unknown>) => QuartzComponent;
declare const WqoConceptView: QuartzComponentConstructor;

export { WqoConceptView, WqoConceptView as default };
