import { z } from "zod";

export const LanguageSchema = z.enum(["fi", "sv", "en"]);
export type Language = z.infer<typeof LanguageSchema>;

export const CompanyNameHitSchema = z.object({
  name: z.string(),
  businessId: z.string(),
  type: z.string(),
});
export type CompanyNameHit = z.infer<typeof CompanyNameHitSchema>;

export const TrademarkHitSchema = z.object({
  name: z.string(),
  registrationNumber: z.string(),
  niceClasses: z.array(z.number()),
});
export type TrademarkHit = z.infer<typeof TrademarkHitSchema>;

export const SurnameHitSchema = z.object({
  name: z.string(),
});
export type SurnameHit = z.infer<typeof SurnameHitSchema>;

export const GeographicalHitSchema = z.object({
  name: z.string(),
});
export type GeographicalHit = z.infer<typeof GeographicalHitSchema>;

export const SectionSummarySchema = z.object({
  shown: z.number(),
  total: z.number(),
});
export type SectionSummary = z.infer<typeof SectionSummarySchema>;

export const SearchResultsSchema = z.object({
  query: z.string(),
  lang: LanguageSchema,
  totalHits: z.number().nullable(),
  shownHits: z.number().nullable(),
  companies: z.object({
    summary: SectionSummarySchema.nullable(),
    hits: z.array(CompanyNameHitSchema),
  }),
  trademarks: z.object({
    summary: SectionSummarySchema.nullable(),
    hits: z.array(TrademarkHitSchema),
  }),
  surnames: z.object({
    summary: SectionSummarySchema.nullable(),
    hits: z.array(SurnameHitSchema),
  }),
  geographical: z.object({
    summary: SectionSummarySchema.nullable(),
    hits: z.array(GeographicalHitSchema),
  }),
});
export type SearchResults = z.infer<typeof SearchResultsSchema>;

export const SectionKeySchema = z.enum([
  "companies",
  "trademarks",
  "surnames",
  "geographical",
]);
export type SectionKey = z.infer<typeof SectionKeySchema>;
