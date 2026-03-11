//
//  task_app_iosApp.swift
//  task-app-ios
//
//  Created by 王杰 on 2025/4/29.
//  Simplified on 2025/9/7.
//

import SwiftUI
import SwiftData

@main
struct task_app_iosApp: App {
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            Task.self,
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            MainTabView()
        }
        .modelContainer(sharedModelContainer)
    }
}
