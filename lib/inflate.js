const _inflate = (data, iter, entityName) => {
    const
        entityIdKey = `${entityName}_id`,
        entityPlural = `${entityName}s`,
        dict = data[entityPlural],
        entity = data[entityName],
        id = iter[entityIdKey];

    if (id && dict[id]) {
        //entity_id was provided in the data and a match was found in the provided dictionary so use the object from the dictionary
        iter[entityName] = dict[id];
    }
    else if (entity && entity.id) {
        //the entity was found but not an entity_id key so set the entity_id to the given entity.id
        entity[entityIdKey] = entity.id;
    }
    else {
        // otherwise nullify the entity and entity_id field
        data[entityName] = null;
        data[entityIdKey] = null;
    }
}

module.exports = (response, entityName, inflatedEntityNames) => {
    const entityNamePlural = `${entityName}s`;

    if(!Array.isArray(response)) {
        response = [response];
    }

    response = response.map(r => {
        let data = r.data,
            entities = data[entityName] || data[entityNamePlural];

        if(!Array.isArray(entities))
            entities = [entities];

        return entities.map(iter => {
            inflatedEntityNames.forEach(i => _inflate(data, iter, i));
            return iter;
        });
    });

    if(response.length === 1) {
        return response[0];
    } else {
        return response;
    }
}