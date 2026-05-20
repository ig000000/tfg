function createTranslationGroupId() {

   return `group_${Date.now()}`;

}

module.exports = {
   createTranslationGroupId
};