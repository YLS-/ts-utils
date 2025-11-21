import { LinkageFunction } from './linkage'

// TODO: find a better typing for 'FeaturizedObject', where keypath function 'frequencies()' is self-contained
//! implementation here prob not good: each instance of Translation will need to specify its own features() keypath... should be defined on a type level
// export type Featurized<Element> = [element: Element, features: (el: Element) => number[]]

// TODO: now Featurized<> type builds a wrapper type and embeds the keypath in the type itself... but not sure how to use that
// TODO: in the end K is a TYPE, but i want to use an INSTANCE of that type... not really like Swift's keypaths
export type FeaturesKeypath<Element> = (el: Element) => number[]
export type Featurized<Element, K extends FeaturesKeypath<Element>> = { element: Element, features: K }

// export type Cluster<C, Element> = [cluster: C, elements: (cl: C) => Featurized<Element>[]]
// export type Cluster<>



//? Hierarchical clustering

// starts with N clusters of 1-element each, and recursively merges 2 nearest clusters, as long as their linkage value is < given threshold
export function clusterHierarchical<Cluster, Element>(clusters: Cluster[], elements: (cl: Cluster) => Element[], frequencies: (el: Element) => number[], linkage: LinkageFunction, distanceThreshold: number, merging: (a: Cluster, b: Cluster) => Cluster): Cluster[] {
	// console.log(`\n🛠  Hierarchical clustering : ${clusters.length} clusters`)
	// logClusters(clusters)
	//? if only 1 cluster (from the beginning, or because all clusters were near enough to be recursively merged) : stop the clustering
	if (clusters.length === 1) { return clusters }
	// console.log(clusters)

	// finds the 2 nearest clusters, based on given linkage function
	const distances = clusters
		.flatMap((clusterA, i) => clusters.map((clusterB, j) => ({ i, j, distance: linkage(clusterA, clusterB, elements, frequencies) })))
		// filters out all distances between a cluster and itself
		.filter(d => d.i !== d.j)
		.sort((a, b) => a.distance - b.distance)

	// minimum match distance
	const minDistance = distances[0] //Math.min(...distances.map(l => l.distance))

	// if nearest 2 clusters are near enough (relative to threshold), the merging is finished
	if (minDistance.distance > distanceThreshold) { return clusters }

	// else if distance between nearest 2 clusters below threshold, merge them and repeat process
	const { i, j } = minDistance //distances.find(l => l.distance === minDistance)!
	// console.log(`Nearest clusters : (${i}, ${j}), distance = ${round(minDistance, 3)} (similarity = ${1 - round(minDistance, 3)})`)
	const [clusterA, clusterB] = [clusters[i], clusters[j]]

	const merged: Cluster = merging(clusterA, clusterB)
	const remaining: Cluster[] = clusters.filter((_, k) => k !== i && k !== j)
	const newClusters: Cluster[] = [merged, ...remaining]
	return clusterHierarchical(newClusters, elements, frequencies, linkage, distanceThreshold, merging)
}






// TODO: kinda works, but flawed logic of building clusters incrementally:
// TODO: if A, B, C, D should be grouped as [A, B] and [C, D], but B and C are not that far away, and D quite different than A and B:
// TODO: C will have similarity barely >0.7, will be grouped as [A, B, C], but then this increases D's simlarity with that cluster since C is there;
// TODO: in short, depending on inclusion order, small "mistakes" can compound into over-clustering more and more dissimilar words
//? => actually its not really a matter of order of clustering, but that the linkage function takes the minimum distance of 2 elements to merge 2 clusters,
//? it's an unavoidable problem with linkage function

// TODO: better approach: just reduce the whole cosines matrix, 1 rank at a time, recursively extracting the most similar (i, j) (with i !== j)
// TODO: and clustering those... => then compare elements with which one of those 2?? same problem in the end, just slightly better order
// TODO: because starting with highest similarity translations first
//? => exactly, that's the standard algorithm for hierarchical clustering, but which linkage function to use is a separate problem

//! basically that linkage metric between element a and cluster B is : average(d(a, b)) for b in B
//! (here i'm computing the similalities, not distance, so taking the max similarity cluster)
/*
function _cluster(translations: VectorizedTranslation[], similarityThreshold: number): TranslationsCluster[] {
	return translations.reduce<TranslationsCluster[]>((_clusters, tr_A, i) => {
		// console.log(`\n🔸 Translation ${i} :`, tr_A.translation)

		// first translation: just start the first cluster
		if (_clusters.length === 0) {
			return [{ translations: [tr_A], points: tr_A.points }]
		}

		// try to find a similar cluster for current translation
		//! computes the similarity of translation A with all existing clusters as average of all similarities
		const cluster_similarities = _clusters.map((cluster, j) => {
			// similarity of current translation with an existing cluster: average cosine similarity with all of that cluster's translations
			const similarity: number = cluster.translations.reduce((sum, tr_B) => sum + _cosineSimilarity(tr_A, tr_B, (tr: VectorizedTranslation) => tr._freqs.map(token => token.tf)), 0) / cluster.translations.length
			// console.log(`\tCluster ${j} :`, cluster.translations.map(tr => tr.translation))
			// console.log(`\tAverage similarity :`, similarity)
			return { index: j, cluster, similarity }
		})

		// heuristic: merges with the highest similarity cluster, only if that similaritiy is at least {SIMILARITY_THRESHOLD}
		const most_similar = cluster_similarities.sort((a, b) => b.similarity - a.similarity)[0]
		if (most_similar.similarity > similarityThreshold) {
			const index = most_similar.index
			_clusters[index].translations.push(tr_A)
			_clusters[index].points += tr_A.points
		}
		// if no similar cluster, just make a new one
		else {
			_clusters.push({ translations: [tr_A], points: tr_A.points })
		}

		// console.dir(_clusters.map(cluster => cluster.translations.map(tr => tr.translation)), { depth: null, colors: true })
		return _clusters
	}, [])
}
*/
