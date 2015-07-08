/* tslint:disable:no-unused-variable */
// Android specific TypeScript declarations
declare var app;
declare var telerik;
declare var gc: () => void;

declare module android {
    module support {
        module v4 {
            module widget {
                class DrawerLayout {
                    constructor(context: android.content.Context);
                }

                module DrawerLayout {
                    class DrawerListener implements IDrawerListener {
                        constructor(implementation: IDrawerListener);

                        onDrawerClosed(drawerView: android.view.View): void;
                        onDrawerOpened(drawerView: android.view.View): void;
                        onDrawerSlide(drawerView: android.view.View, offset: number): void;
                        onDrawerStateChanged(newState: number): void;
                    }

                    class LayoutParams extends android.view.ViewGroup.MarginLayoutParams {
                        constructor(width: number, height: number, gravity?: number);
                        gravity: number;
                    }

                    interface IDrawerListener {
                        onDrawerClosed(drawerView: android.view.View): void;
                        onDrawerOpened(drawerView: android.view.View): void;
                        onDrawerSlide(drawerView: android.view.View, offset: number): void;
                        onDrawerStateChanged(newState: number): void;
                    }
                }
            }

            module app {
                class ActionBarDrawerToggle {
                    constructor(activity: android.app.Activity, layout: widget.DrawerLayout, imageResId: number, openResId: number, closeResId: number);
                }
            }
        }

        export module v7 {
            export module app {
                export class AppCompatActivity extends android.support.v4.app.FragmentActivity {
                    getSupportActionBar(): android.support.v7.app.ActionBar;
                }
                
                /**
                 * A window feature at the top of the activity that may display the activity title, navigation modes, and other interactive items.
                 */
                export class ActionBar extends java.lang.Object {
                    constructor();
                    /**
                     * Standard navigation mode. Consists of either a logo or icon and title text with an optional subtitle. Clicking any of these elements will dispatch onOptionsItemSelected to the host Activity with a MenuItem with item ID android.R.id.home.
                     */
                    static NAVIGATION_MODE_STANDARD: number;
                    /**
                     * List navigation mode. Instead of static title text this mode presents a list menu for navigation within the activity. e.g. this might be presented to the user as a dropdown list.
                     */
                    static NAVIGATION_MODE_LIST: number;
                    /**
                     * Tab navigation mode. Instead of static title text this mode presents a series of tabs for navigation within the activity.
                     */
                    static NAVIGATION_MODE_TABS: number;
                    /**
                     * Use logo instead of icon if available. This flag will cause appropriate navigation modes to use a wider logo in place of the standard icon.
                     */
                    static DISPLAY_USE_LOGO: number;
                    /**
                     * Show 'home' elements in this action bar, leaving more space for other navigation elements. This includes logo and icon.
                     */
                    static DISPLAY_SHOW_HOME: number;
                    /**
                     * Display the 'home' element such that it appears as an 'up' affordance. e.g. show an arrow to the left indicating the action that will be taken.
                     */
                    static DISPLAY_HOME_AS_UP: number;
                    /**
                     * Show the activity title and subtitle, if present.
                     */
                    static DISPLAY_SHOW_TITLE: number;
                    /**
                     * Show the custom view if one has been set. #setCustomView(View) #setDisplayOptions(int) #setDisplayOptions(int, int)
                     */
                    static DISPLAY_SHOW_CUSTOM: number;
                    static class: java.lang.Class<android.app.ActionBar>;
                    Subtitle: string;
                    Title: string;
                    NavigationMode: number;
                    CustomView: android.view.View;
                    DisplayOptions: number;
                    /**
                     * Set the action bar into custom navigation mode, supplying a view for custom navigation.
                     * @param view Custom navigation view to place in the ActionBar.
                     */
                    setCustomView(view: android.view.View): void;
                    /**
                     * Set the action bar into custom navigation mode, supplying a view for custom navigation. 
                     * @param view Custom navigation view to place in the ActionBar.
                     * @param layoutParams How this custom view should layout in the bar.
                     */
                    setCustomView(view: android.view.View, layoutParams: android.app.ActionBar.LayoutParams): void;
                    /**
                     * Set the action bar into custom navigation mode, supplying a view for custom navigation.
                     * @param resId Resource ID of a layout to inflate into the ActionBar.
                     */
                    setCustomView(resId: number): void;
                    /**
                     * Set the icon to display in the 'home' section of the action bar. The action bar will use an icon specified by its style or the activity icon by default.
                     * @param resId Resource ID of a drawable to show as an icon.
                     */
                    setIcon(resId: number): void;
                    /**
                     * Set the icon to display in the 'home' section of the action bar. The action bar will use an icon specified by its style or the activity icon by default.
                     * @param icon Drawable to show as an icon.
                     */
                    setIcon(icon: android.graphics.drawable.Drawable): void;
                    /**
                     * Set the logo to display in the 'home' section of the action bar. The action bar will use a logo specified by its style or the activity logo by default.
                     * @param resId Resource ID of a drawable to show as a logo.
                     */
                    setLogo(resId: number): void;
                    /**
                     * Set the logo to display in the 'home' section of the action bar. The action bar will use a logo specified by its style or the activity logo by default.
                     * @param logo Drawable to show as a logo.
                     */
                    setLogo(logo: android.graphics.drawable.Drawable): void;
                    /**
                     * Set the adapter and navigation callback for list navigation mode.
                     * @param adapter An adapter that will provide views both to display
                     * @param callback An OnNavigationListener that will receive events when the user
                     */
                    setListNavigationCallbacks(adapter: android.widget.ISpinnerAdapter, callback: android.app.ActionBar.IOnNavigationListener): void;
                    /**
                     * Set the selected navigation item in list or tabbed navigation modes.
                     * @param position Position of the item to select.
                     */
                    setSelectedNavigationItem(position: number): void;
                    /**
                     * Get the position of the selected navigation item in list or tabbed navigation modes.
                     */
                    getSelectedNavigationIndex(): number;
                    /**
                     * Get the number of navigation items present in the current navigation mode.
                     */
                    getNavigationItemCount(): number;
                    /**
                     * Set the action bar's title. This will only be displayed if #DISPLAY_SHOW_TITLE is set.
                     * @param title Title to set
                     */
                    setTitle(title: string): void;
                    /**
                     * Set the action bar's title. This will only be displayed if #DISPLAY_SHOW_TITLE is set.
                     * @param resId Resource ID of title string to set
                     */
                    setTitle(resId: number): void;
                    /**
                     * Set the action bar's subtitle. This will only be displayed if #DISPLAY_SHOW_TITLE is set. Set to null to disable the subtitle entirely.
                     * @param subtitle Subtitle to set
                     */
                    setSubtitle(subtitle: string): void;
                    /**
                     * Set the action bar's subtitle. This will only be displayed if #DISPLAY_SHOW_TITLE is set.
                     * @param resId Resource ID of subtitle string to set
                     */
                    setSubtitle(resId: number): void;
                    /**
                     * Set display options. This changes all display option bits at once. To change a limited subset of display options, see #setDisplayOptions(int, int). 
                     * @param options A combination of the bits defined by the DISPLAY_ constants
                     */
                    setDisplayOptions(options: number): void;
                    /**
                     * Set selected display options. Only the options specified by mask will be changed. To change all display option bits at once, see #setDisplayOptions(int). 
                     * @param options A combination of the bits defined by the DISPLAY_ constants
                     * @param mask A bit mask declaring which display options should be changed.
                     */
                    setDisplayOptions(options: number, mask: number): void;
                    /**
                     * Set whether to display the activity logo rather than the activity icon. A logo is often a wider, more detailed image.
                     * @param useLogo true to use the activity logo, false to use the activity icon.
                     */
                    setDisplayUseLogoEnabled(useLogo: boolean): void;
                    /**
                     * Set whether to include the application home affordance in the action bar. Home is presented as either an activity icon or logo.
                     * @param showHome true to show home, false otherwise.
                     */
                    setDisplayShowHomeEnabled(showHome: boolean): void;
                    /**
                     * Set whether home should be displayed as an "up" affordance. Set this to true if selecting "home" returns up by a single level in your UI rather than back to the top level or front page.
                     * @param showHomeAsUp true to show the user that selecting home will return one
                     */
                    setDisplayHomeAsUpEnabled(showHomeAsUp: boolean): void;
                    /**
                     * Set whether an activity title/subtitle should be displayed.
                     * @param showTitle true to display a title/subtitle if present.
                     */
                    setDisplayShowTitleEnabled(showTitle: boolean): void;
                    /**
                     * Set whether a custom view should be displayed, if set.
                     * @param showCustom true if the currently set custom view should be displayed, false otherwise.
                     */
                    setDisplayShowCustomEnabled(showCustom: boolean): void;
                    /**
                     * Set the ActionBar's background. This will be used for the primary action bar. 
                     * @param d Background drawable
                     */
                    setBackgroundDrawable(d: android.graphics.drawable.Drawable): void;
                    /**
                     * Set the ActionBar's stacked background. This will appear in the second row/stacked bar on some devices and configurations.
                     * @param d Background drawable for the stacked row
                     */
                    setStackedBackgroundDrawable(d: android.graphics.drawable.Drawable): void;
                    /**
                     * Set the ActionBar's split background. This will appear in the split action bar containing menu-provided action buttons on some devices and configurations.
                     * @param d Background drawable for the split bar
                     */
                    setSplitBackgroundDrawable(d: android.graphics.drawable.Drawable): void;
                    getCustomView(): android.view.View;
                    /**
                     * Returns the current ActionBar title in standard mode. Returns null if #getNavigationMode() would not return #NAVIGATION_MODE_STANDARD.
                     */
                    getTitle(): string;
                    /**
                     * Returns the current ActionBar subtitle in standard mode. Returns null if #getNavigationMode() would not return #NAVIGATION_MODE_STANDARD.
                     */
                    getSubtitle(): string;
                    /**
                     * Returns the current navigation mode. The result will be one of: <ul> <li>#NAVIGATION_MODE_STANDARD</li> <li>#NAVIGATION_MODE_LIST</li> <li>#NAVIGATION_MODE_TABS</li> </ul>
                     */
                    getNavigationMode(): number;
                    /**
                     * Set the current navigation mode.
                     * @param mode The new mode to set.
                     */
                    setNavigationMode(mode: number): void;
                    getDisplayOptions(): number;
                    /**
                     * Create and return a new Tab. This tab will not be included in the action bar until it is added.
                     */
                    newTab(): android.app.ActionBar.Tab;
                    /**
                     * Add a tab for use in tabbed navigation mode. The tab will be added at the end of the list. If this is the first tab to be added it will become the selected tab.
                     * @param tab Tab to add
                     */
                    addTab(tab: android.app.ActionBar.Tab): void;
                    /**
                     * Add a tab for use in tabbed navigation mode. The tab will be added at the end of the list.
                     * @param tab Tab to add
                     * @param setSelected True if the added tab should become the selected tab.
                     */
                    addTab(tab: android.app.ActionBar.Tab, setSelected: boolean): void;
                    /**
                     * Add a tab for use in tabbed navigation mode. The tab will be inserted at <code>position</code>. If this is the first tab to be added it will become the selected tab.
                     * @param tab The tab to add
                     * @param position The new position of the tab
                     */
                    addTab(tab: android.app.ActionBar.Tab, position: number): void;
                    /**
                     * Add a tab for use in tabbed navigation mode. The tab will be insterted at <code>position</code>.
                     * @param tab The tab to add
                     * @param position The new position of the tab
                     * @param setSelected True if the added tab should become the selected tab.
                     */
                    addTab(tab: android.app.ActionBar.Tab, position: number, setSelected: boolean): void;
                    /**
                     * Remove a tab from the action bar. If the removed tab was selected it will be deselected and another tab will be selected if present.
                     * @param tab The tab to remove
                     */
                    removeTab(tab: android.app.ActionBar.Tab): void;
                    /**
                     * Remove a tab from the action bar. If the removed tab was selected it will be deselected and another tab will be selected if present.
                     * @param position Position of the tab to remove
                     */
                    removeTabAt(position: number): void;
                    /**
                     * Remove all tabs from the action bar and deselect the current tab.
                     */
                    removeAllTabs(): void;
                    /**
                     * Select the specified tab. If it is not a child of this action bar it will be added.
                     * @param tab Tab to select
                     */
                    selectTab(tab: android.app.ActionBar.Tab): void;
                    /**
                     * Returns the currently selected tab if in tabbed navigation mode and there is at least one tab present.
                     */
                    getSelectedTab(): android.app.ActionBar.Tab;
                    /**
                     * Returns the tab at the specified index.
                     * @param index Index value in the range 0-get
                     */
                    getTabAt(index: number): android.app.ActionBar.Tab;
                    /**
                     * Returns the number of tabs currently registered with the action bar.
                     */
                    getTabCount(): number;
                    /**
                     * Retrieve the current height of the ActionBar.
                     */
                    getHeight(): number;
                    /**
                     * Show the ActionBar if it is not currently showing. If the window hosting the ActionBar does not have the feature Window#FEATURE_ACTION_BAR_OVERLAY it will resize application content to fit the new space available.
                     */
                    show(): void;
                    /**
                     * Hide the ActionBar if it is currently showing. If the window hosting the ActionBar does not have the feature Window#FEATURE_ACTION_BAR_OVERLAY it will resize application content to fit the new space available.
                     */
                    hide(): void;
                    isShowing(): boolean;
                    /**
                     * Add a listener that will respond to menu visibility change events.
                     * @param listener The new listener to add
                     */
                    addOnMenuVisibilityListener(listener: android.app.ActionBar.IOnMenuVisibilityListener): void;
                    /**
                     * Remove a menu visibility listener. This listener will no longer receive menu visibility change events.
                     * @param listener A listener to remove that was previously added
                     */
                    removeOnMenuVisibilityListener(listener: android.app.ActionBar.IOnMenuVisibilityListener): void;
                    /**
                     * Enable or disable the "home" button in the corner of the action bar. (Note that this is the application home/up affordance on the action bar, not the systemwide home button.)
                     * @param enabled true to enable the home button, false to disable the home button.
                     */
                    setHomeButtonEnabled(enabled: boolean): void;
                    /**
                     * Returns a Context with an appropriate theme for creating views that will appear in the action bar. If you are inflating or instantiating custom views that will appear in an action bar, you should use the Context returned by this method. (This includes adapters used for list navigation mode.) This will ensure that views contrast properly against the action bar.
                     */
                    getThemedContext(): android.content.Context;
                    
                    // ADDED methods
                    setHomeAsUpIndicator(resId: number): void;
                    setHomeAsUpIndicator(indicator: android.graphics.drawable.Drawable): void;
                }
            }
        }
    }
}

declare module com {
    export module tns {
        export module Async {
            export class CompleteCallback {
                constructor(implementation: ICompleteCallback);
                onComplete(result: Object, context: Object): void;
            }

            export interface ICompleteCallback {
                onComplete(result: Object, context: Object): void;
            }

            export module Http {
                export class KeyValuePair {
                    public key: string;
                    public value: string;
                    constructor(key: string, value: string);
                }

                export class RequestOptions {
                    public url: string;
                    public method: string;
                    public headers: java.util.ArrayList<KeyValuePair>;
                    public content: string;
                    public timeout: number;
                    public screenWidth: number;
                    public screenHeight: number;
                }

                export class RequestResult {
                    public raw: java.io.ByteArrayOutputStream;
                    public headers: java.util.ArrayList<KeyValuePair>;
                    public statusCode: number;
                    public responseAsString: string;
                    public responseAsImage: android.graphics.Bitmap;
                    public error: java.lang.Exception;
                }

                export function MakeRequest(options: RequestOptions, callback: CompleteCallback, context: any);
            }
        }
    }
}
