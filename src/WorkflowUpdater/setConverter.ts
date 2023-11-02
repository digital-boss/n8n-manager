function ver1to3conv(node: any): void {
    switch (node.typeVersion) {
        case 1:
            // Update typeVersion to 3
            node.typeVersion = 3;

            // Create an array to hold the transformed values
            const transformedValues: any[] = [];

            // Transform "number" values
            if (node.parameters.values.number && node.parameters.values.number.length > 0) {
                node.parameters.values.number.forEach((numberValue: any) => {
                    transformedValues.push({
                        name: numberValue.name,
                        type: 'numberValue',
                        numberValue: numberValue.value,
                    });
                });
            }

            // Transform "string" values
            if (node.parameters.values.string && node.parameters.values.string.length > 0) {
                node.parameters.values.string.forEach((stringValue: any) => {
                    transformedValues.push({
                        name: stringValue.name,
                        stringValue: stringValue.value,
                        type: 'stringValue',
                    });
                });
            }

            // Transform "boolean" values
            if (node.parameters.values.boolean && node.parameters.values.boolean.length > 0) {
                node.parameters.values.boolean.forEach((booleanValue: any) => {
                    transformedValues.push({
                        name: booleanValue.name,
                        type: 'booleanValue',
                    });
                });
            }

            // Update the parameters structure
            node.parameters = {
                fields: {
                    values: transformedValues,
                },
                options: node.parameters.options,
            };

            if (node.parameters.keepOnlySet = true) {
                // If "keepOnlySet" is true, add "include: none"
                node.parameters.include = "none";
                delete node.parameters.keepOnlySet;
            }
            break;
    }
}


// export const converters = [
//     [ver1predicate, ver1to3conv],
//     //  [ver2predicate, ver2conv],
//     [(node) => node.type === 'set', report],
// ]

//## TODO Do the predicates contain condition for node type?