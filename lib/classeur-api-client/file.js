/**
 * Object representation of a Classeur file's content.
 * @typedef {Object} ClasseurClient~FileContent
 * @property {String} text - The text content of the file.
 * @property {Number} rev - The revision number of the file.
 * @property {Object} properties - File properties.
 * @property {Object[]} discussions - Array of objects, each representing a discussion entry regarding this file.
 */

/**
 * Object representation of a Classeur file.
 * @typedef {Object} ClasseurClient~File
 * @property {String} id - The ID of the file.
 * @property {String} name - The name of the file, as visible in the Classeur UI.
 * @property {*} permission - Information on the access permissions of the file.
 * @property {Number} updated - Timestamp (since epoch): the last time the file was updated.
 * @property {ClasseurClient~FileContent} content - The content of the file.
 */

/**
 * Object representation of a Classeur file's metadata.
 * @typedef {Object} ClasseurClient~FileMetadata
 * @property {String} id - The ID of the file.
 * @property {String} name - The name of the file, as visible in the Classeur UI.
 * @property {*} permission - Information on the access permissions of the file.
 * @property {String} userId - The ID of the user who owns the file.
 * @property {Number} updated - Timestamp (since epoch): the last time the file was updated.
 */