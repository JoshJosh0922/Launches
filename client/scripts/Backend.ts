export const useDisplayData = defineStore('bigDataStore', () => {
    const data = ref([] as Array<any>);  // Initialize as an empty array of any type

    function setData(newData: Array<any>) {
        data.value = newData;
    }

    function $reset() {
        data.value = [];
    }

    return { data, setData, $reset };
});

export const useFavoriteData = defineStore('FavStorage', () => {
    const data = ref([] as Array<any>);  // Initialize as an empty array of any type

    function setData(newData: Object) {
        data.value.push(newData);
    }

    function updateData(newData: Array<any>) {
        data.value = newData;
    }

    function $reset() {
        data.value = [];
    }

    function SearchData(val: number) {
        return data.value.some(res => res?.id === val)
    }

    return { data, setData, $reset, updateData, SearchData };
});
