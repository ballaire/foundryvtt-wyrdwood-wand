export default class WyrdwoodWandDataModel extends foundry.abstract.TypeDataModel {
  /**
   * Convert the schema to a plain object.
   * 
   * The built in `toObject()` method will ignore derived data when using Data Models.
   * This additional method will instead use the spread operator to return a simplified
   * version of the data.
   * 
   * @returns {object} Plain object either via deepClone or the spread operator.
   */
  toPlainObject() {
    return {...this};
  }

  // Converts separate lines to <p>s
  _processTextareaHtml(text) {
    const pattern = /^\s*\<(\/|p|li|h|div|ul|ol|table|tr|th|td).*\>\s*$/;
    let processedLines = [];
    text.split('\n').forEach((line) => {
      if (pattern.test(line)) {
        processedLines.push(line);
      }
      else {
        processedLines.push(`<p>${line}</p>`);
      }
    });

    return processedLines.join('\n');
  }
}