import { DEFAULT_XLIFF_SYNC_SETTINGS } from './defaults';
import { XmlNode } from './xml-node';
import { XlfDocument } from './xlf-document';
import { translationState } from './xlf-translation-state';

export class XlfTranslator {
  public static async synchronize(
    source: string,
    target: string | undefined,
    targetLanguage: string | undefined,
  ): Promise<string | undefined> {
    const findByXliffGeneratorNoteAndSource: boolean =
      DEFAULT_XLIFF_SYNC_SETTINGS.findByXliffGeneratorNoteAndSource;
    const findByXliffGeneratorAndDeveloperNote: boolean =
      DEFAULT_XLIFF_SYNC_SETTINGS.findByXliffGeneratorAndDeveloperNote;
    const findByXliffGeneratorNote: boolean = DEFAULT_XLIFF_SYNC_SETTINGS.findByXliffGeneratorNote;
    const findBySourceAndDeveloperNote: boolean = DEFAULT_XLIFF_SYNC_SETTINGS.findBySourceAndDeveloperNote;
    const findBySource: boolean = DEFAULT_XLIFF_SYNC_SETTINGS.findBySource;
    const copyFromSourceForLanguages: string[] = DEFAULT_XLIFF_SYNC_SETTINGS.copyFromSourceForLanguages;
    const copyFromSourceForSameLanguage: boolean = DEFAULT_XLIFF_SYNC_SETTINGS.copyFromSourceForSameLanguage;
    const copyFromSourceOverwrite: boolean = DEFAULT_XLIFF_SYNC_SETTINGS.copyFromSourceOverwrite;
    const parseFromDeveloperNote: boolean = DEFAULT_XLIFF_SYNC_SETTINGS.parseFromDeveloperNote;
    const parseFromDeveloperNoteOverwrite: boolean = DEFAULT_XLIFF_SYNC_SETTINGS.parseFromDeveloperNoteOverwrite;
    const detectSourceTextChanges: boolean = DEFAULT_XLIFF_SYNC_SETTINGS.detectSourceTextChanges;
    const clearTranslationAfterSourceTextChange: boolean =
      DEFAULT_XLIFF_SYNC_SETTINGS.clearTranslationAfterSourceTextChange;
    const ignoreLineEndingTypeChanges: boolean = DEFAULT_XLIFF_SYNC_SETTINGS.ignoreLineEndingTypeChanges;
    const missingTranslationKeyword: string = DEFAULT_XLIFF_SYNC_SETTINGS.missingTranslation;
    const unitMaps: string = DEFAULT_XLIFF_SYNC_SETTINGS.unitMaps;

    let copyFromSource = false;

    const mergedDocument = await XlfDocument.load(source);
    if (!mergedDocument || !mergedDocument.valid) {
      return undefined;
    }

    if (!target && !targetLanguage) {
      return undefined;
    }

    const targetDocument = target
      ? await XlfDocument.load(target)
      : XlfDocument.create(<"1.2" | "2.0">mergedDocument.version, targetLanguage!);
    const language = targetDocument.targetLanguage;

    if (language) {
      mergedDocument.targetLanguage = language;
      copyFromSource = copyFromSourceForSameLanguage && mergedDocument.sourceLanguage === language;
      copyFromSource = copyFromSource || copyFromSourceForLanguages.indexOf(language) >= 0;
    }

    const sourceTranslations: { [key: string]: (XmlNode | string)[] } = {};
    const findByXliffGenNotesIsEnabled: boolean =
      findByXliffGeneratorNoteAndSource || findByXliffGeneratorAndDeveloperNote || findByXliffGeneratorNote;
    const findByIsEnabled: boolean =
      findByXliffGenNotesIsEnabled || findBySourceAndDeveloperNote || findBySource || copyFromSource || parseFromDeveloperNote;

    if (unitMaps !== 'None') {
      if (unitMaps === 'Id') {
        targetDocument.CreateUnitMaps(false, false, false, false, false);
      } else {
        targetDocument.CreateUnitMaps(
          findByXliffGeneratorNoteAndSource,
          findByXliffGeneratorAndDeveloperNote,
          findByXliffGeneratorNote,
          findBySourceAndDeveloperNote,
          findBySource,
        );
      }
    }

    mergedDocument.translationUnitNodes.forEach((unit) => {
      let targetUnit = targetDocument.findTranslationUnit(unit.attributes.id);
      let translChildNodes: (XmlNode | string)[] | undefined;

      if (!targetUnit && findByIsEnabled) {
        const developerNote = mergedDocument.getUnitDeveloperNote(unit);
        const sourceText = mergedDocument.getUnitSource(unit);

        if (findByXliffGenNotesIsEnabled) {
          const xliffGeneratorNote = mergedDocument.getUnitXliffGeneratorNote(unit);

          if (xliffGeneratorNote) {
            if (findByXliffGeneratorNoteAndSource && sourceText) {
              targetUnit = targetDocument.findTranslationUnitByXliffGeneratorNoteAndSource(xliffGeneratorNote, sourceText);
            }

            if (!targetUnit && findByXliffGeneratorAndDeveloperNote && developerNote) {
              targetUnit = targetDocument.findTranslationUnitByXliffGeneratorAndDeveloperNote(
                xliffGeneratorNote,
                developerNote,
              );
            }

            if (!targetUnit && findByXliffGeneratorNote) {
              targetUnit = targetDocument.findTranslationUnitByXliffGeneratorNote(xliffGeneratorNote);
            }
          }
        }

        if (!targetUnit && sourceText) {
          if (findBySourceAndDeveloperNote) {
            const transUnitTrl = targetDocument.findTranslationUnitBySourceAndDeveloperNote(sourceText, developerNote);
            if (transUnitTrl) {
              translChildNodes = targetDocument.getUnitTranslationChildren(transUnitTrl);
            }
          }

          if (
            (!translChildNodes || (translChildNodes.length === 1 && translChildNodes[0] === missingTranslationKeyword)) &&
            findBySource
          ) {
            if (!(sourceText in sourceTranslations)) {
              const transUnitTrl = targetDocument.findFirstTranslationUnitBySource(sourceText);
              if (transUnitTrl) {
                translChildNodes = targetDocument.getUnitTranslationChildren(transUnitTrl);
                if (translChildNodes) {
                  sourceTranslations[sourceText] = translChildNodes;
                }
              }
            } else {
              translChildNodes = sourceTranslations[sourceText];
            }
          }
        }
      }

      if (
        (!translChildNodes || (translChildNodes.length === 1 && translChildNodes[0] === missingTranslationKeyword)) &&
        (copyFromSource || parseFromDeveloperNote)
      ) {
        let hasNoTranslation = false;
        if (targetUnit) {
          const translationText: string | undefined = targetDocument.getUnitTranslationText(targetUnit);
          if (missingTranslationKeyword === '%EMPTY%') {
            hasNoTranslation = !translationText;
          } else {
            hasNoTranslation = translationText === missingTranslationKeyword;
          }
        } else {
          hasNoTranslation = true;
        }

        const shouldParseFromDevNote: boolean = parseFromDeveloperNote && (hasNoTranslation || parseFromDeveloperNoteOverwrite);
        const shouldCopyFromSource: boolean = copyFromSource && (hasNoTranslation || copyFromSourceOverwrite);

        if (
          (!translChildNodes || (translChildNodes.length === 1 && translChildNodes[0] === missingTranslationKeyword)) &&
          shouldParseFromDevNote
        ) {
          const translationFromDeveloperNote: string | undefined = mergedDocument.getUnitTranslationFromDeveloperNote(unit);
          if (translationFromDeveloperNote) {
            translChildNodes = [translationFromDeveloperNote];
          }
        }
        if (
          (!translChildNodes || (translChildNodes.length === 1 && translChildNodes[0] === missingTranslationKeyword)) &&
          shouldCopyFromSource
        ) {
          translChildNodes = targetDocument.getUnitSourceChildren(unit);
        }
      }

      mergedDocument.mergeUnit(unit, targetUnit, translChildNodes);

      if (detectSourceTextChanges && targetUnit) {
        let mergedSourceText = mergedDocument.getUnitSourceText(unit);
        const mergedTranslText = mergedDocument.getUnitTranslationText(unit);
        let origSourceText = targetDocument.getUnitSourceText(targetUnit);

        if (mergedSourceText && origSourceText && mergedTranslText) {
          if (ignoreLineEndingTypeChanges) {
            mergedSourceText = mergedSourceText.replace(/\r\n/g, '\n');
            origSourceText = origSourceText.replace(/\r\n/g, '\n');
          }

          if (mergedSourceText !== origSourceText) {
            if (clearTranslationAfterSourceTextChange) {
              mergedDocument.clearUnitTranslation(unit);
              mergedDocument.setState(unit, translationState.missingTranslation);
            } else {
              mergedDocument.setXliffSyncNote(unit, 'Source text has changed. Please review the translation.');
              mergedDocument.setState(unit, translationState.needsWorkTranslation);
            }
          }
        }
      }
    });

    return mergedDocument.extract();
  }
}
