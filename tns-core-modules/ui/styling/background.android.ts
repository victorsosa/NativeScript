import utils = require("utils/utils");
import common = require("./background-common");
import definition = require("ui/styling/background");
import view = require("ui/core/view");
import types = require("utils/types");
import * as styleModule from "./style";
import * as buttonModule from "ui/button";
import { CacheLayerType } from "utils/utils";

//@private
declare module "ui/styling/background" {
    // We are using "ad" here to avoid namespace collision with the global android object
    export module ad {
        export class BorderDrawable extends android.graphics.drawable.ColorDrawable {
            borderWidth: number;
            cornerRadius: number;
            borderColor: number;
            background: Background;
        }
    }
}

var button: typeof buttonModule;
var style: typeof styleModule;

function ensureLazyRequires() {
    if (!button) {
        button = require("ui/button");
    }

    if (!style) {
        style = require("./style");
    }
}

global.moduleMerge(common, exports);

// We are using "ad" here to avoid namespace collision with the global android object
export module ad {
    Object.defineProperty(ad, "BorderDrawable", {
        get: function () {
            ensureBorderDrawable();
            return BorderDrawableClass;
        },
        configurable: true
    });

    var BorderDrawableClass;
    function ensureBorderDrawable() {
        if (BorderDrawableClass) {
            return;
        }

        class BorderDrawable extends android.graphics.drawable.ColorDrawable implements definition.ad.BorderDrawable {
            private _density = utils.layout.getDisplayDensity();
            private _borderWidth: number;
            private _cornerRadius: number;
            private _borderColor: number;
            private _clipPath: string;

            constructor() {
                super();
                return global.__native(this);
            }

            get clipPath(): string {
                return this._clipPath;
            }
            set clipPath(value: string) {
                if (this._clipPath !== value) {
                    this._clipPath = value;
                    this.invalidateSelf();
                }
            }

            get borderWidth(): number {
                return this._borderWidth;
            }
            set borderWidth(value: number) {
                if (this._borderWidth !== value) {
                    this._borderWidth = value;
                    this.invalidateSelf();
                }
            }

            get cornerRadius(): number {
                return this._cornerRadius;
            }
            set cornerRadius(value: number) {
                if (this._cornerRadius !== value) {
                    this._cornerRadius = value;
                    this.invalidateSelf();
                }
            }

            get borderColor(): number {
                return this._borderColor;
            }
            set borderColor(value: number) {
                if (this._borderColor !== value) {
                    this._borderColor = value;
                    this.invalidateSelf();
                }
            }

            private _background: common.Background
            get background(): common.Background {
                return this._background;
            }
            set background(value: common.Background) {
                if (this._background !== value) {
                    this._background = value;
                    this.invalidateSelf();
                }
            }

            public draw(canvas: android.graphics.Canvas): void {
                let bounds = this.getBounds();
                let borderWidth = this._borderWidth * this._density;
                let halfBorderWidth = borderWidth / 2;

                // We will inset background colors and images so antialiasing will not color pixels outside the border.
                // If the border is transparent we will backoff less, and we will not backoff more than half a pixel or half the border width.
                let normalizedBorderAlpha = android.graphics.Color.alpha(this._borderColor) / 255;
                let backoffAntialias = Math.min(0.5, halfBorderWidth) * normalizedBorderAlpha;
                let backgroundBoundsF = new android.graphics.RectF(bounds.left + backoffAntialias, bounds.top + backoffAntialias, bounds.right - backoffAntialias, bounds.bottom - backoffAntialias);

                let outerRadius = this._cornerRadius * this._density;

                // draw background
                if (this.background.color && this.background.color.android) {
                    let backgroundColorPaint = new android.graphics.Paint();
                    backgroundColorPaint.setStyle(android.graphics.Paint.Style.FILL);
                    backgroundColorPaint.setColor(this.background.color.android);
                    backgroundColorPaint.setAntiAlias(true);

                    if (this.clipPath) {
                        drawClipPath(this.clipPath, canvas, backgroundColorPaint, backgroundBoundsF);
                    } else {
                        canvas.drawRoundRect(backgroundBoundsF, outerRadius, outerRadius, backgroundColorPaint);
                    }
                }

                // draw image
                if (this.background.image) {
                    let bitmap = this.background.image.android;
                    let params = this.background.getDrawParams(bounds.width(), bounds.height());

                    let transform = new android.graphics.Matrix();
                    if (params.sizeX > 0 && params.sizeY > 0) {
                        let scaleX = params.sizeX / bitmap.getWidth();
                        let scaleY = params.sizeY / bitmap.getHeight();
                        transform.setScale(scaleX, scaleY, 0, 0);
                    } else {
                        params.sizeX = bitmap.getWidth();
                        params.sizeY = bitmap.getHeight();
                    }
                    transform.postTranslate(params.posX - backoffAntialias, params.posY - backoffAntialias);

                    let shader = new android.graphics.BitmapShader(bitmap, android.graphics.Shader.TileMode.REPEAT, android.graphics.Shader.TileMode.REPEAT);
                    shader.setLocalMatrix(transform);

                    let backgroundImagePaint = new android.graphics.Paint();
                    backgroundImagePaint.setShader(shader);

                    let imageWidth = params.repeatX ? bounds.width() : params.sizeX;
                    let imageHeight = params.repeatY ? bounds.height() : params.sizeY;
                    params.posX = params.repeatX ? 0 : params.posX;
                    params.posY = params.repeatY ? 0 : params.posY;

                    if (this.clipPath) {
                        drawClipPath(this.clipPath, canvas, backgroundImagePaint, backgroundBoundsF);
                    } else {
                        let supportsPathOp = android.os.Build.VERSION.SDK_INT >= 19;
                        if (supportsPathOp) {
                            // Path.Op can be used in API level 19+ to achieve the perfect geometry.
                            let backgroundPath = new android.graphics.Path();
                            backgroundPath.addRoundRect(backgroundBoundsF, outerRadius, outerRadius, android.graphics.Path.Direction.CCW);
                            let backgroundNoRepeatPath = new android.graphics.Path();
                            backgroundNoRepeatPath.addRect(params.posX, params.posY, params.posX + imageWidth, params.posY + imageHeight, android.graphics.Path.Direction.CCW);
                            (<any>backgroundPath).op(backgroundNoRepeatPath, (<any>android).graphics.Path.Op.INTERSECT);
                            canvas.drawPath(backgroundPath, backgroundImagePaint);
                        } else {
                            // Clipping here will not be antialiased but at least it won't shine through the rounded corners.
                            canvas.save();
                            canvas.clipRect(params.posX, params.posY, params.posX + imageWidth, params.posY + imageHeight);
                            canvas.drawRoundRect(backgroundBoundsF, outerRadius, outerRadius, backgroundImagePaint);
                            canvas.restore();
                        }
                    }
                }

                // draw border
                if (borderWidth > 0 && this._borderColor) {
                    let middleBoundsF = new android.graphics.RectF(bounds.left + halfBorderWidth, bounds.top + halfBorderWidth, bounds.right - halfBorderWidth, bounds.bottom - halfBorderWidth);
                    let borderPaint = new android.graphics.Paint();
                    borderPaint.setColor(this._borderColor);
                    borderPaint.setAntiAlias(true);

                    if (this.clipPath) {
                        borderPaint.setStyle(android.graphics.Paint.Style.STROKE);
                        borderPaint.setStrokeWidth(borderWidth);
                        drawClipPath(this.clipPath, canvas, borderPaint, backgroundBoundsF);
                    } else {
                        if (outerRadius <= 0) {
                            borderPaint.setStyle(android.graphics.Paint.Style.STROKE);
                            borderPaint.setStrokeWidth(borderWidth);
                            canvas.drawRect(middleBoundsF, borderPaint);
                        } else if (outerRadius >= borderWidth) {
                            borderPaint.setStyle(android.graphics.Paint.Style.STROKE);
                            borderPaint.setStrokeWidth(borderWidth);
                            let middleRadius = Math.max(0, outerRadius - halfBorderWidth);
                            canvas.drawRoundRect(middleBoundsF, middleRadius, middleRadius, borderPaint);
                        } else {
                            let borderPath = new android.graphics.Path();
                            let borderOuterBoundsF = new android.graphics.RectF(bounds.left, bounds.top, bounds.right, bounds.bottom);
                            borderPath.addRoundRect(borderOuterBoundsF, outerRadius, outerRadius, android.graphics.Path.Direction.CCW);
                            let borderInnerBoundsF = new android.graphics.RectF(bounds.left + borderWidth, bounds.top + borderWidth, bounds.right - borderWidth, bounds.bottom - borderWidth);
                            borderPath.addRect(borderInnerBoundsF, android.graphics.Path.Direction.CW);
                            borderPaint.setStyle(android.graphics.Paint.Style.FILL);
                            canvas.drawPath(borderPath, borderPaint);
                        }
                    }
                }
            }
        }

        BorderDrawableClass = BorderDrawable;
    }

    var SDK: number;
    function getSDK() {
        if (!SDK) {
            SDK = android.os.Build.VERSION.SDK_INT;
        }

        return SDK;
    }

    var _defaultBackgrounds = new Map<string, android.graphics.drawable.Drawable>();

    export function onBackgroundOrBorderPropertyChanged(v: view.View) {
        var nativeView = <android.view.View>v._nativeView;
        var cache = <CacheLayerType>v._nativeView;
        
        if (!nativeView) {
            return;
        }

        ensureBorderDrawable();
        ensureLazyRequires();

        var clipPathValue = v.style._getValue(style.clipPathProperty);

        var backgroundValue = v.style._getValue(style.backgroundInternalProperty);
        var borderWidth = v.borderWidth;
        var bkg = <any>nativeView.getBackground();

        if (v instanceof button.Button && !types.isNullOrUndefined(bkg) && types.isFunction(bkg.setColorFilter) &&
            v.borderWidth === 0 && v.borderRadius === 0 && !clipPathValue &&
            types.isNullOrUndefined(v.style._getValue(style.backgroundImageProperty)) &&
            !types.isNullOrUndefined(v.style._getValue(style.backgroundColorProperty))) {
            let backgroundColor = bkg.backgroundColor = v.style._getValue(style.backgroundColorProperty).android;
            bkg.setColorFilter(backgroundColor, android.graphics.PorterDuff.Mode.SRC_IN);
            bkg.backgroundColor = backgroundColor;
        } 
        else if (v.borderWidth || v.borderRadius || clipPathValue || !backgroundValue.isEmpty()) {
            if (!(bkg instanceof BorderDrawableClass)) {
                bkg = new BorderDrawableClass();
                let viewClass = types.getClass(v);
                if (!(v instanceof button.Button) && !_defaultBackgrounds.has(viewClass)) {
                    _defaultBackgrounds.set(viewClass, nativeView.getBackground());
                }

                nativeView.setBackground(bkg);
            }

            bkg.borderWidth = v.borderWidth;
            bkg.cornerRadius = v.borderRadius;
            bkg.borderColor = v.borderColor ? v.borderColor.android : android.graphics.Color.TRANSPARENT;
            bkg.background = backgroundValue;
            bkg.clipPath = clipPathValue;

            if ((v.borderWidth || v.borderRadius || clipPathValue) && getSDK() < 18) {
                // Switch to software because of unsupported canvas methods if hardware acceleration is on:
                // http://developer.android.com/guide/topics/graphics/hardware-accel.html
                cache.layerType = cache.getLayerType();
                cache.setLayerType(android.view.View.LAYER_TYPE_SOFTWARE, null);
            }
        }
        else {
            // reset the value with the default native value
            if (v instanceof button.Button) {
                var nativeButton = new android.widget.Button(nativeView.getContext());
                nativeView.setBackground(nativeButton.getBackground());
            }
            else {
                let viewClass = types.getClass(v);
                if (_defaultBackgrounds.has(viewClass)) {
                    nativeView.setBackground(_defaultBackgrounds.get(viewClass));
                }
            }

            if (cache.layerType !== undefined) {
                cache.setLayerType(cache.layerType, null);
                cache.layerType = undefined;
            }
        }

        var density = utils.layout.getDisplayDensity();
        nativeView.setPadding(
            Math.round((borderWidth + v.style.paddingLeft) * density),
            Math.round((borderWidth + v.style.paddingTop) * density),
            Math.round((borderWidth + v.style.paddingRight) * density),
            Math.round((borderWidth + v.style.paddingBottom) * density)
        );
    }
}

function drawClipPath(clipPath: string, canvas: android.graphics.Canvas, paint: android.graphics.Paint, bounds: android.graphics.RectF) {
    var functionName = clipPath.substring(0, clipPath.indexOf("("));
    var value = clipPath.replace(`${functionName}(`, "").replace(")", "");

    if (functionName === "rect") {
        var arr = value.split(/[\s]+/);

        var top = common.cssValueToDevicePixels(arr[0], bounds.top);
        var left = common.cssValueToDevicePixels(arr[1], bounds.left);
        var bottom = common.cssValueToDevicePixels(arr[2], bounds.bottom);
        var right = common.cssValueToDevicePixels(arr[3], bounds.right);

        canvas.drawRect(left, top, right, bottom, paint);

    } else if (functionName === "circle") {
        var arr = value.split(/[\s]+/);

        var radius = common.cssValueToDevicePixels(arr[0], (bounds.width() > bounds.height() ? bounds.height() : bounds.width()) / 2);
        var y = common.cssValueToDevicePixels(arr[2], bounds.height());
        var x = common.cssValueToDevicePixels(arr[3], bounds.width());

        canvas.drawCircle(x, y, radius, paint);

    } else if (functionName === "ellipse") {
        var arr = value.split(/[\s]+/);

        var rX = common.cssValueToDevicePixels(arr[0], bounds.right);
        var rY = common.cssValueToDevicePixels(arr[1], bounds.bottom);
        var cX = common.cssValueToDevicePixels(arr[3], bounds.right);
        var cY = common.cssValueToDevicePixels(arr[4], bounds.bottom);
        
        var left = cX - rX;
        var top = cY - rY;
        var right = (rX * 2) + left;
        var bottom = (rY * 2) + top;

        canvas.drawOval(new android.graphics.RectF(left, top, right, bottom), paint);

    } else if (functionName === "polygon") {
        var path = new android.graphics.Path();
        var firstPoint: view.Point;
        var arr = value.split(/[,]+/);
        for (let i = 0; i < arr.length; i++) {
            let xy = arr[i].trim().split(/[\s]+/);
            let point: view.Point = {
                x: common.cssValueToDevicePixels(xy[0], bounds.width()),
                y: common.cssValueToDevicePixels(xy[1], bounds.height())
            };
            
            if (!firstPoint) {
                firstPoint = point;
                path.moveTo(point.x, point.y);
            }

            path.lineTo(point.x, point.y);
        }

        path.lineTo(firstPoint.x, firstPoint.y);

        canvas.drawPath(path, paint);
    }
}