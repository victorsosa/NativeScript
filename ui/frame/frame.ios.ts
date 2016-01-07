﻿import frameCommon = require("./frame-common");
import definition = require("ui/frame");
import trace = require("trace");
import pages = require("ui/page");
import enums = require("ui/enums");
import utils = require("utils/utils");
import view = require("ui/core/view");
import uiUtils = require("ui/utils");
import * as typesModule from "utils/types";
import platform = require("platform");

global.moduleMerge(frameCommon, exports);

var ENTRY = "_entry";
var NAV_DEPTH = "_navDepth";

var navDepth = -1;

export class Frame extends frameCommon.Frame {
    private _ios: iOSFrame;
    private _paramToNavigate: any;

    public _shouldSkipNativePop: boolean = false;
    public _navigateToEntry: definition.BackstackEntry;
    public _widthMeasureSpec: number;
    public _heightMeasureSpec: number;
    public _right: number;
    public _bottom: number;

    constructor() {
        super();
        this._ios = new iOSFrame(this);
    }

    public onLoaded() {
        super.onLoaded();

        if (this._paramToNavigate) {
            this.navigate(this._paramToNavigate);
            this._paramToNavigate = undefined;
        }
    }

    public navigate(param: any) {
        if (this.isLoaded) {
            super.navigate(param);
        }
        else {
            this._paramToNavigate = param;
        }
    }

    public _navigateCore(backstackEntry: definition.BackstackEntry) {
        var viewController: UIViewController = backstackEntry.resolvedPage.ios;
        if (!viewController) {
            throw new Error("Required page does have an viewController created.");
        }

        navDepth++;

        var animated = false;
        if (this.currentPage) {
            animated = this._getIsAnimatedNavigation(backstackEntry.entry);
        }

        backstackEntry[NAV_DEPTH] = navDepth;
        viewController[ENTRY] = backstackEntry;

        this._updateActionBar(backstackEntry.resolvedPage);

        // First navigation.
        if (!this._currentEntry) {
            this._pushViewControllerAnimated(viewController, animated);
            return;
        }

        // We should clear the entire history.
        if (backstackEntry.entry.clearHistory) {
            viewController.navigationItem.hidesBackButton = true;
            var newControllers = NSMutableArray.alloc().initWithCapacity(1);
            newControllers.addObject(viewController);
            this._setViewControllersAnimated(newControllers, animated);
            return;
        }

        // We should hide the current entry from the back stack.
        if (!this._isEntryBackstackVisible(this._currentEntry)) {
            var newControllers = NSMutableArray.alloc().initWithArray(this._ios.controller.viewControllers);
            if (newControllers.count === 0) {
                throw new Error("Wrong controllers count.");
            }

            // the code below fixes a phantom animation that appears on the Back button in this case
            // TODO: investigate why the animation happens at first place before working around it
            viewController.navigationItem.hidesBackButton = this.backStack.length === 0;

            // swap the top entry with the new one
            newControllers.removeLastObject();
            newControllers.addObject(viewController);

            // replace the controllers instead of pushing directly
            this._setViewControllersAnimated(newControllers, animated);
            return;
        }

        // General case.
        this._pushViewControllerAnimated(viewController, animated);
    }

    private _pushViewControllerAnimated(viewController: UIViewController, animated: boolean) {
        trace.write(`${this._ios.controller}.pushViewControllerAnimated(${viewController}, ${animated}); navDepth: ${navDepth}`, trace.categories.Navigation);
        this._ios.controller.pushViewControllerAnimated(viewController, animated);
    }

    private _setViewControllersAnimated(newControllers: NSArray, animated: boolean) {
        trace.write(`${this._ios.controller}.setViewControllersAnimated(${newControllers}, ${animated}); navDepth: ${navDepth}`, trace.categories.Navigation);
        this._ios.controller.setViewControllersAnimated(newControllers, animated);
    }

    public _goBackCore(backstackEntry: definition.BackstackEntry) {
        navDepth = backstackEntry[NAV_DEPTH];

        if (!this._shouldSkipNativePop) {
            var controller = backstackEntry.resolvedPage.ios;
            var animated = this._getIsAnimatedNavigation(backstackEntry.entry);

            this._updateActionBar(backstackEntry.resolvedPage);
            trace.write(`${this._ios.controller}.popToViewControllerAnimated(${controller}, ${animated}); navDepth: ${navDepth}`, trace.categories.Navigation);
            this._ios.controller.popToViewControllerAnimated(controller, animated);
        }
    }

    public _updateActionBar(page?: pages.Page): void {
        super._updateActionBar(page);

        var page = page || this.currentPage;
        var newValue = this._getNavBarVisible(page);

        this._ios.showNavigationBar = newValue;
        if (this._ios.controller.navigationBar) {
            this._ios.controller.navigationBar.userInteractionEnabled = this.navigationQueueIsEmpty();
        }
    }

    public _getNavBarVisible(page: pages.Page): boolean {
        switch (this._ios.navBarVisibility) {
            case enums.NavigationBarVisibility.always:
                return true;

            case enums.NavigationBarVisibility.never:
                return false;

            case enums.NavigationBarVisibility.auto:
                let newValue: boolean;

                var types: typeof typesModule = require("utils/types");

                if (page && types.isDefined(page.actionBarHidden)) {
                    newValue = !page.actionBarHidden;
                }
                else {
                    newValue = this.backStack.length > 0 || (page && page.actionBar && !page.actionBar._isEmpty());
                }

                newValue = !!newValue; // Make sure it is boolean
                return newValue;
        }
    }

    public get ios(): definition.iOSFrame {
        return this._ios;
    }

    get _nativeView(): any {
        return this._ios.controller.view;
    }

    public static get defaultAnimatedNavigation(): boolean {
        return frameCommon.Frame.defaultAnimatedNavigation;
    }
    public static set defaultAnimatedNavigation(value: boolean) {
        frameCommon.Frame.defaultAnimatedNavigation = value;
    }

    public requestLayout(): void {
        super.requestLayout();
        // Invalidate our Window so that layout is triggered again.
        var window = this._nativeView.window;
        if (window) {
            window.setNeedsLayout();
        }
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {

        let width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        let widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        let height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        let heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        this._widthMeasureSpec = widthMeasureSpec;
        this._heightMeasureSpec = heightMeasureSpec;

        let result = this.measurePage(this.currentPage);
        if (this._navigateToEntry && this.currentPage) {
            let newPageSize = this.measurePage(this._navigateToEntry.resolvedPage);
            result.measuredWidth = Math.max(result.measuredWidth, newPageSize.measuredWidth);
            result.measuredHeight = Math.max(result.measuredHeight, newPageSize.measuredHeight);
        }
        let widthAndState = view.View.resolveSizeAndState(result.measuredWidth, width, widthMode, 0);
        let heightAndState = view.View.resolveSizeAndState(result.measuredHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public measurePage(page: pages.Page): { measuredWidth: number; measuredHeight: number } {
        // If background does not span under statusbar - reduce available height.
        let heightSpec: number = this._heightMeasureSpec;
        if (page && !page.backgroundSpanUnderStatusBar && !this.parent) {
            let height = utils.layout.getMeasureSpecSize(this._heightMeasureSpec);
            let heightMode = utils.layout.getMeasureSpecMode(this._heightMeasureSpec);
            let statusBarHeight = uiUtils.ios.getStatusBarHeight();
            heightSpec = utils.layout.makeMeasureSpec(height - statusBarHeight, heightMode);
        }

        return view.View.measureChild(this, page, this._widthMeasureSpec, heightSpec);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        this._right = right;
        this._bottom = bottom;
        this.layoutPage(this.currentPage);
        if (this._navigateToEntry && this.currentPage) {
            this.layoutPage(this._navigateToEntry.resolvedPage);
        }
    }

    public layoutPage(page: pages.Page): void {
        if (page && (<any>page)._viewWillDisappear) {
            //https://github.com/NativeScript/NativeScript/issues/1201
            return;
        }

        // If background does not span under statusbar - reduce available height and adjust top offset.
        let statusBarHeight = (page && !page.backgroundSpanUnderStatusBar && !this.parent) ? uiUtils.ios.getStatusBarHeight() : 0;

        view.View.layoutChild(this, page, 0, statusBarHeight, this._right, this._bottom);
    }

    public get navigationBarHeight(): number {
        var navigationBar = this._ios.controller.navigationBar;
        return (navigationBar && !this._ios.controller.navigationBarHidden) ? navigationBar.frame.size.height : 0;
    }

    public _setNativeViewFrame(nativeView: any, frame: any) {
        // HACK: The plugin https://github.com/hackiftekhar/IQKeyboardManager offsets our Frame's 'nativeView.frame.origin.y'
        // to a negative value so the currently focused TextField/TextView is always on the screen while the soft keyboard is showing.
        // Our Frame always wants to have an origin of {0, 0}, so if someone else has been playing with origin.x or origin.y do not bring it back to {0, 0}.
        if (nativeView.frame.size.width === frame.size.width && nativeView.frame.size.height === frame.size.height) {
            return;
        }

        super._setNativeViewFrame(nativeView, frame);
    }

    public remeasureFrame(): void {
        this.requestLayout();
        let window: UIWindow = this._nativeView.window;
        if (window) {
            window.layoutIfNeeded();
        }
    }
}

class TransitionAnimator extends NSObject implements UIViewControllerAnimatedTransitioning {
    public static ObjCProtocols = [UIViewControllerAnimatedTransitioning];

    private _navigationController: UINavigationController;
    private _operation: number;
    private _fromVC: UIViewController;
    private _toVC: UIViewController

    public static init(navigationController: UINavigationController, operation: number, fromVC: UIViewController, toVC: UIViewController): TransitionAnimator {
        var operationType: string;
        trace.write(`TransitionAnimator.init(${navigationController}, ${operationType}, ${fromVC}, ${toVC})`, trace.categories.NativeLifecycle);
        var impl = <TransitionAnimator>TransitionAnimator.new();
        impl._navigationController = navigationController;
        impl._operation = operation;
        impl._fromVC = fromVC;
        impl._toVC = toVC;
        return impl;
}

    public animateTransition(transitionContext: UIViewControllerContextTransitioning): void {
        trace.write(`TransitionAnimator.animateTransition(${transitionContext})`, trace.categories.NativeLifecycle);

        var containerView = (<any>transitionContext).performSelector("containerView");
        var fromView = this._fromVC.view;
        var toView = this._toVC.view;

        fromView.alpha = 1.0;
        toView.alpha = 0.0;
        var screenWidth = platform.screen.mainScreen.widthDIPs;
        switch (this._operation) {
            case UINavigationControllerOperation.UINavigationControllerOperationPush:
                fromView.transform = CGAffineTransformIdentity;
                toView.transform = CGAffineTransformMakeTranslation(screenWidth, 0);
                containerView.insertSubviewAboveSubview(toView, fromView);
                break;
            case UINavigationControllerOperation.UINavigationControllerOperationPop:
                fromView.transform = CGAffineTransformIdentity;
                toView.transform = CGAffineTransformMakeTranslation(-screenWidth, 0);
                containerView.insertSubviewBelowSubview(toView, fromView);
                break;
        }

        var duration = this.transitionDuration(transitionContext);
        UIView.animateWithDurationAnimationsCompletion(duration,
            () => {
                UIView.setAnimationCurve(UIViewAnimationCurve.UIViewAnimationCurveEaseOut);
                
                this._fromVC.view.alpha = 0.0;
                this._toVC.view.alpha = 1.0;

                switch (this._operation) {
                    case UINavigationControllerOperation.UINavigationControllerOperationPush:
                        fromView.transform = CGAffineTransformMakeTranslation(-screenWidth, 0);
                        toView.transform = CGAffineTransformIdentity;
                        break;
                    case UINavigationControllerOperation.UINavigationControllerOperationPop:
                        fromView.transform = CGAffineTransformMakeTranslation(screenWidth, 0);
                        toView.transform = CGAffineTransformIdentity;
                        break;
                }
            },
            () => {
                (<any>transitionContext).performSelectorWithObject("completeTransition:", true);
            }
        ); 
    }

    public transitionDuration(transitionContext: UIViewControllerContextTransitioning): number {
        return 5;//seconds
    }
}

class UINavigationControllerImpl extends UINavigationController implements UINavigationControllerDelegate {
    public static ObjCProtocols = [UINavigationControllerDelegate];

    private _owner: WeakRef<Frame>;

    public static initWithOwner(owner: WeakRef<Frame>): UINavigationControllerImpl {
        var controller = <UINavigationControllerImpl>UINavigationControllerImpl.new();
        controller._owner = owner;
        return controller;
    }

    get owner(): Frame {
        return this._owner.get();
    }

    public viewDidLoad(): void {
        let owner = this._owner.get();
        if (owner) {
            owner.onLoaded();
        }
    }

    public viewDidLayoutSubviews(): void {
        let owner = this._owner.get();
        if (owner) {
            trace.write(this._owner + " viewDidLayoutSubviews, isLoaded = " + owner.isLoaded, trace.categories.ViewHierarchy);
            owner._updateLayout();
        }
    }

    public navigationControllerWillShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        // In this method we need to layout the new page otherwise page will be shown empty and update after that which is bad UX.
        let frame = this._owner.get();
        if (!frame) {
            return;
        }

        let newEntry: definition.BackstackEntry = viewController[ENTRY];
        let newPage = newEntry.resolvedPage;
        if (!newPage.parent) {
            if (!frame._currentEntry) {
                // First navigation
                frame._currentEntry = newEntry;
            }
            else {
                frame._navigateToEntry = newEntry;
            }

            frame._addView(newPage);
            frame.remeasureFrame();
        }
        else if (newPage.parent !== frame) {
            throw new Error("Page is already shown on another frame.");
        }

        newPage.actionBar.update();
    }

    public navigationControllerDidShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        let frame = this._owner.get();
        if (!frame) {
            return;
        }

        let newEntry: definition.BackstackEntry = viewController[ENTRY];
        let newPage = newEntry.resolvedPage;

        // For some reason iOS calls navigationControllerDidShowViewControllerAnimated twice for the 
        // main-page resulting in double 'loaded' and 'navigatedTo' events being fired.
        if (!(<any>newPage)._delayLoadedEvent) {
            return;
        }

        let backStack = frame.backStack;
        let currentEntry = backStack.length > 0 ? backStack[backStack.length - 1] : null;
        
        // This code check if navigation happened through UI (e.g. back button or swipe gesture).
        // When calling goBack on frame isBack will be false.
        let isBack: boolean = currentEntry && newEntry === currentEntry;

        let currentNavigationContext;
        let navigationQueue = (<any>frame)._navigationQueue;
        for (let i = 0; i < navigationQueue.length; i++) {
            if (navigationQueue[i].entry === newEntry) {
                currentNavigationContext = navigationQueue[i];
                break;
            }
        }

        let isBackNavigation = currentNavigationContext ? currentNavigationContext.isBackNavigation : false;

        if (isBack) {
            try {
                frame._shouldSkipNativePop = true;
                frame.goBack();
            }
            finally {
                frame._shouldSkipNativePop = false;
            }
        }

        let page = frame.currentPage;
        if (page && !navigationController.viewControllers.containsObject(page.ios)) {
            frame._removeView(page);
        }

        frame._navigateToEntry = null;
        frame._currentEntry = newEntry;
        frame.remeasureFrame();

        // In iOS we intentionally delay the raising of the 'loaded' event so both platforms behave identically.
        // The loaded event must be raised AFTER the page is part of the windows hierarchy and 
        // frame.topmost().currentPage is set to the page instance.
        // https://github.com/NativeScript/NativeScript/issues/779
        (<any>newPage)._delayLoadedEvent = false;
        newPage._emit(view.View.loadedEvent);

        frame._updateActionBar(newPage);

        // notify the page
        newPage.onNavigatedTo(isBack || isBackNavigation);
        frame._processNavigationQueue(newPage);
    }

    public navigationControllerSupportedInterfaceOrientations(): number {
        return UIInterfaceOrientationMask.UIInterfaceOrientationMaskAll;
    }

    public navigationControllerAnimationControllerForOperationFromViewControllerToViewController(navigationController: UINavigationController, operation: number, fromVC: UIViewController, toVC: UIViewController): any {
        var transitionAnimator: TransitionAnimator;
        if (operation !== UINavigationControllerOperation.UINavigationControllerOperationNone) {
            transitionAnimator = TransitionAnimator.init(navigationController, operation, fromVC, toVC);
        }
        trace.write(`UINavigationControllerImpl.navigationControllerAnimationControllerForOperationFromViewControllerToViewController(${operation}, ${fromVC}, ${toVC}): ${transitionAnimator})`, trace.categories.NativeLifecycle);
        return transitionAnimator;
    }
}

/* tslint:disable */
class iOSFrame implements definition.iOSFrame {
    /* tslint:enable */
    private _controller: UINavigationControllerImpl;
    private _showNavigationBar: boolean;
    private _navBarVisibility: string;

    constructor(owner: Frame) {
        this._controller = UINavigationControllerImpl.initWithOwner(new WeakRef(owner));
        this._controller.delegate = this._controller;
        this._controller.automaticallyAdjustsScrollViewInsets = false;
        //this.showNavigationBar = false;
        this._navBarVisibility = enums.NavigationBarVisibility.auto;
    }

    public get controller() {
        return this._controller;
    }

    public get showNavigationBar(): boolean {
        return this._showNavigationBar;
    }
    public set showNavigationBar(value: boolean) {
        var change = this._showNavigationBar !== value;
        this._showNavigationBar = value;
        this._controller.navigationBarHidden = !value;

        let currentPage = this._controller.owner.currentPage;
        if (currentPage && change) {
            currentPage.requestLayout();
        }
    }

    public get navBarVisibility(): string {
        return this._navBarVisibility;
    }
    public set navBarVisibility(value: string) {
        this._navBarVisibility = value;
    }
}
