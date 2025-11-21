// Firebase Admin SDK
import admin from 'firebase-admin'
import type { App, AppOptions } from 'firebase-admin/app'

let appScripts: App | null

// initializes only once
export function initializeAppScripts(options?: AppOptions): App {
	if (appScripts) { return appScripts}

	appScripts = admin.initializeApp(options)
	return appScripts
}

initializeAppScripts()

export const firestore = admin.firestore()
export const storage = admin.storage()
