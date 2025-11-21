
export function removeNull<T extends Record<string, any>>(obj: T): T {
	let cleanedObject: T = {} as T

	for (const key of Object.keys(obj)) {
		const typedKey = key as keyof T
		if (obj[typedKey] === null) continue
		cleanedObject[typedKey] = obj[typedKey]
	}

	return cleanedObject
}

export function removeUndefined<T extends Record<string, any>>(obj: T): T {
	let cleanedObject: T = {} as T

	for (const key of Object.keys(obj)) {
		const typedKey = key as keyof T
		if (obj[typedKey] === undefined) continue
		cleanedObject[typedKey] = obj[typedKey]
	}

	return cleanedObject
}

export function removeEmptyFields<T>(obj: Record<string, T>): Record<string, T> {
	return Object.fromEntries(Object.entries(obj).filter(([key, value]) => !!value))
}
