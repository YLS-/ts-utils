import { cosineSimilarity } from './cosine-similarity'

//? Linkage functions (used to calculate inter-cluster distances)

export type LinkageFunction = <Cluster, Element>(clusterA: Cluster, clusterB: Cluster, elements: (cl: Cluster) => Element[], frequencies: (el: Element) => number[]) => number

//* linkage function for "nearest-neighbor clustering"
//https://en.wikipedia.org/wiki/Single-linkage_clustering
export function singleLinkage<Cluster, Element>(clusterA: Cluster, clusterB: Cluster, elements: (cl: Cluster) => Element[], frequencies: (el: Element) => number[]): number {
	const elementsA = elements(clusterA)
	const elementsB = elements(clusterB)

	const distances: number[] = elementsA.flatMap(el_A => elementsB.map(el_B => 1 - cosineSimilarity(el_A, el_B, frequencies)))
	return Math.min(...distances)
}


//* linkage function for "farthest-neighbor clustering"
// https://en.wikipedia.org/wiki/Complete-linkage_clustering
export function completeLinkage<Cluster, Element>(clusterA: Cluster, clusterB: Cluster, elements: (cl: Cluster) => Element[], frequencies: (el: Element) => number[]): number {
	const elementsA = elements(clusterA)
	const elementsB = elements(clusterB)

	const distances: number[] = elementsA.flatMap(el_A => elementsB.map(el_B => 1 - cosineSimilarity(el_A, el_B, frequencies)))
	return Math.max(...distances)
}


//* linkage function for "unweighted average clustering" (UPGMA)
// https://en.wikipedia.org/wiki/UPGMA
export function unweightedAverageLinkage<Cluster, Element>(clusterA: Cluster, clusterB: Cluster, elements: (cl: Cluster) => Element[], frequencies: (el: Element) => number[]): number {
	const elementsA = elements(clusterA)
	const elementsB = elements(clusterB)

	const sum: number = elementsA.reduce((sum_ext, a) => sum_ext + elementsB.reduce((sum_int, b) => sum_int + 1 - cosineSimilarity(a, b, frequencies), 0), 0)
	const average = sum / (elementsA.length * elementsB.length)
	return average
}
