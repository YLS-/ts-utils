
export function mapFields<K extends string, V>(arr: readonly K[], mapping: (key: K) => V): Record<K, V> {
	return arr.reduce((acc: Record<K, V>, item: K) => {
		// return { ...acc, [item]: mapping(item) }
		acc[item] = mapping(item)
		return acc
	}, {} as Record<K, V>)
}
