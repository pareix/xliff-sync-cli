export interface XliffSyncDefaults {
  findByXliffGeneratorNoteAndSource: boolean;
  findByXliffGeneratorAndDeveloperNote: boolean;
  findByXliffGeneratorNote: boolean;
  findBySourceAndDeveloperNote: boolean;
  findBySource: boolean;
  copyFromSourceForLanguages: string[];
  copyFromSourceForSameLanguage: boolean;
  copyFromSourceOverwrite: boolean;
  parseFromDeveloperNote: boolean;
  parseFromDeveloperNoteOverwrite: boolean;
  detectSourceTextChanges: boolean;
  clearTranslationAfterSourceTextChange: boolean;
  ignoreLineEndingTypeChanges: boolean;
  unitMaps: 'None' | 'Id' | 'All';
  developerNoteDesignation: string;
  xliffGeneratorNoteDesignation: string;
  preserveTargetAttributes: boolean;
  preserveTargetAttributesOrder: boolean;
  preserveTargetChildNodes: boolean;
  parseFromDeveloperNoteSeparator: string;
  parseFromDeveloperNoteTrimCharacters: string;
  missingTranslation: string;
  needsWorkTranslationSubstate: string;
  addNeedsWorkTranslationNote: boolean;
  useSelfClosingTags: boolean;
}

export const DEFAULT_XLIFF_SYNC_SETTINGS: XliffSyncDefaults = {
  findByXliffGeneratorNoteAndSource: true,
  findByXliffGeneratorAndDeveloperNote: true,
  findByXliffGeneratorNote: true,
  findBySourceAndDeveloperNote: false,
  findBySource: false,
  copyFromSourceForLanguages: [],
  copyFromSourceForSameLanguage: false,
  copyFromSourceOverwrite: false,
  parseFromDeveloperNote: false,
  parseFromDeveloperNoteOverwrite: false,
  detectSourceTextChanges: true,
  clearTranslationAfterSourceTextChange: false,
  ignoreLineEndingTypeChanges: false,
  unitMaps: 'All',
  developerNoteDesignation: 'Developer',
  xliffGeneratorNoteDesignation: 'Xliff Generator',
  preserveTargetAttributes: false,
  preserveTargetAttributesOrder: false,
  preserveTargetChildNodes: false,
  parseFromDeveloperNoteSeparator: '|',
  parseFromDeveloperNoteTrimCharacters: '',
  missingTranslation: '%EMPTY%',
  needsWorkTranslationSubstate: 'xliffSync:needsWork',
  addNeedsWorkTranslationNote: true,
  useSelfClosingTags: true,
};
