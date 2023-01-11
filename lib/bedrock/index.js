module.exports = (data) => {
    return {
        loadItemStates(itemStates) {
            for(const item of itemStates) {
                const name = item.name.replace('minecraft:', '');
                const id = data.itemsByName[name].id;

                data.items[id]?.id = item.runtime_id;
                data.itemsByName[name]?.id = item.runtime_id;
            }
        }
    }
}
