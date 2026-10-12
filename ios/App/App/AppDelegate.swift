import UIKit
import Capacitor
import LocalAuthentication
import Security

class AzuhaBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(NativeVaultPlugin())
    }
}

@objc(NativeVaultPlugin)
class NativeVaultPlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "NativeVaultPlugin"
    let jsName = "NativeVault"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "storeKey", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "unlock", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "remove", returnType: CAPPluginReturnPromise)
    ]
    private let service = "id.fahmidjawas.keuanganrumah.nativevault"

    private func biometricAvailable() -> Bool {
        let context = LAContext()
        var error: NSError?
        return context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
    }

    @objc func storeKey(_ call: CAPPluginCall) {
        guard let accountId = call.getString("accountId"), !accountId.isEmpty,
              let key = call.getString("key"), !key.isEmpty else {
            call.reject("Akun atau kunci vault tidak valid.")
            return
        }
        guard biometricAvailable() else {
            call.reject("Biometrik belum tersedia atau belum didaftarkan. Gunakan password/PIN.")
            return
        }
        guard let access = SecAccessControlCreateWithFlags(nil,
            kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly,
            .biometryCurrentSet, nil) else {
            call.reject("Keamanan perangkat tidak tersedia.")
            return
        }
        let base: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: accountId
        ]
        SecItemDelete(base as CFDictionary)
        var item = base
        item[kSecAttrAccessControl as String] = access
        item[kSecValueData as String] = Data(key.utf8)
        let status = SecItemAdd(item as CFDictionary, nil)
        if status == errSecSuccess { call.resolve() }
        else { call.reject("Kunci biometrik tidak dapat disimpan di Keychain.") }
    }

    @objc func unlock(_ call: CAPPluginCall) {
        guard let accountId = call.getString("accountId"), !accountId.isEmpty else {
            call.reject("Akun biometrik tidak valid.")
            return
        }
        guard biometricAvailable() else {
            call.reject("Biometrik tidak tersedia. Gunakan password/PIN.")
            return
        }
        DispatchQueue.global(qos: .userInitiated).async {
            let context = LAContext()
            context.localizedFallbackTitle = "Gunakan password/PIN"
            let query: [String: Any] = [
                kSecClass as String: kSecClassGenericPassword,
                kSecAttrService as String: self.service,
                kSecAttrAccount as String: accountId,
                kSecReturnData as String: true,
                kSecMatchLimit as String: kSecMatchLimitOne,
                kSecUseAuthenticationContext as String: context,
                kSecUseOperationPrompt as String: "Buka A-Zuha Finance"
            ]
            var result: CFTypeRef?
            let status = SecItemCopyMatching(query as CFDictionary, &result)
            guard status == errSecSuccess, let data = result as? Data,
                  let key = String(data: data, encoding: .utf8) else {
                call.reject("Biometrik dibatalkan atau kunci tidak tersedia. Gunakan password/PIN.")
                return
            }
            call.resolve(["key": key])
        }
    }

    @objc func remove(_ call: CAPPluginCall) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service
        ]
        let status = SecItemDelete(query as CFDictionary)
        if status == errSecSuccess || status == errSecItemNotFound { call.resolve() }
        else { call.reject("Akses biometrik tidak dapat dihapus.") }
    }
}

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}
