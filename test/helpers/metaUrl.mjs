export const importMetaUrl = () => {
    if (!import.meta || !import.meta.url) {
        throw new Error('import.meta.url is not available');
    }
    return import.meta.url;
};
