/**
 * Object representation of a Classeur file entry in a folder.
 * @typedef {Object} FolderFileEntry
 * @memberof module:classeur-api-client
 * @property {String} id - The ID of the file.
 * @property {String} name - The name of the file, as visible in the Classeur UI.
 * @property {String} userId - The ID of the user who owns the file.
 * @property {Number} updated - Timestamp (since epoch): the last time the file was updated.
 */

/**
 * Object representation of a Classeur folder.
 * @typedef {Object} Folder
 * @memberof module:classeur-api-client
 * @property {String} id - The ID of the folder.
 * @property {String} name - The name of the folder, as visible in the Classeur UI.
 * @property {String} userId - The ID of the user who owns the folder.
 * @property {Number} updated - Timestamp (since epoch): the last time the folder was updated.
 * @property {module:classeur-api-client.FolderFileEntry[]} files - List of objects, each representing a file contained within the folder.
 */

/**
 * Object representation of a Classeur folder's metadata.
 * @typedef {Object} FolderMetadata
 * @memberof module:classeur-api-client
 * @property {String} id - The ID of the folder.
 * @property {String} name - The name of the folder, as visible in the Classeur UI.
 * @property {String} userId - The ID of the user who owns the folder.
 * @property {Number} updated - Timestamp (since epoch): the last time the folder was updated.
 */
