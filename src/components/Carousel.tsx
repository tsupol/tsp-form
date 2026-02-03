import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  Children,
  type ReactNode,
  type KeyboardEvent,
  type TouchEvent,
  type MouseEvent,
  type HTMLAttributes,
} from 'react';
import clsx from 'clsx';
import '../styles/carousel.css';

export interface CarouselProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  children: ReactNode;

  // Navigation
  showDots?: boolean;
  showArrows?: boolean;
  hideControlsOnTouch?: boolean;

  // Customization (slot props)
  prevArrow?: ReactNode;
  nextArrow?: ReactNode;
  dotClassName?: string;
  arrowClassName?: string;

  // Behavior
  loop?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  pauseOnHover?: boolean;
  swipeable?: boolean;
  swipeThreshold?: number;

  // Animation
  transitionDuration?: number;

  // Callbacks
  onSlideChange?: (index: number) => void;

  // Controlled mode
  activeIndex?: number;

  // Content fitting
  objectFit?: 'contain' | 'cover' | 'fill' | 'none';
}

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      children,
      className,
      showDots = true,
      showArrows = true,
      hideControlsOnTouch = true,
      prevArrow,
      nextArrow,
      dotClassName,
      arrowClassName,
      loop = false,
      autoplay = false,
      autoplayInterval = 5000,
      pauseOnHover = true,
      swipeable = true,
      swipeThreshold = 50,
      transitionDuration = 300,
      onSlideChange,
      activeIndex,
      objectFit = 'cover',
      ...rest
    },
    ref
  ) => {
    const slides = Children.toArray(children);
    const slideCount = slides.length;

    // Internal state for uncontrolled mode
    const [internalIndex, setInternalIndex] = useState(0);
    const currentIndex = activeIndex !== undefined ? activeIndex : internalIndex;

    // Drag/swipe state
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef(0);
    const dragStartY = useRef(0);
    const dragCurrentX = useRef(0);
    const isHorizontalSwipe = useRef<boolean | null>(null);

    // Touch device detection
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    // Autoplay pause state
    const [isPaused, setIsPaused] = useState(false);

    // Container ref for width calculations
    const containerRef = useRef<HTMLDivElement>(null);

    // Detect touch device
    useEffect(() => {
      const checkTouch = () => {
        setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
      };
      checkTouch();
      window.addEventListener('resize', checkTouch);
      return () => window.removeEventListener('resize', checkTouch);
    }, []);

    const goToSlide = useCallback(
      (index: number) => {
        let newIndex = index;

        if (loop) {
          if (index < 0) {
            newIndex = slideCount - 1;
          } else if (index >= slideCount) {
            newIndex = 0;
          }
        } else {
          newIndex = Math.max(0, Math.min(index, slideCount - 1));
        }

        if (activeIndex === undefined) {
          setInternalIndex(newIndex);
        }
        onSlideChange?.(newIndex);
      },
      [activeIndex, loop, onSlideChange, slideCount]
    );

    const goToPrev = useCallback(() => {
      goToSlide(currentIndex - 1);
    }, [currentIndex, goToSlide]);

    const goToNext = useCallback(() => {
      goToSlide(currentIndex + 1);
    }, [currentIndex, goToSlide]);

    // Autoplay
    useEffect(() => {
      if (!autoplay || isPaused || slideCount <= 1) return;

      const interval = setInterval(() => {
        goToNext();
      }, autoplayInterval);

      return () => clearInterval(interval);
    }, [autoplay, autoplayInterval, goToNext, isPaused, slideCount]);

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goToPrev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          goToNext();
        }
      },
      [goToNext, goToPrev]
    );

    // Shared drag end logic
    const handleDragEnd = useCallback(() => {
      if (!swipeable || !isDragging) return;

      const delta = dragStartX.current - dragCurrentX.current;

      if (isHorizontalSwipe.current && Math.abs(delta) > swipeThreshold) {
        if (delta < 0) {
          // Swiped right - go to previous
          goToPrev();
        } else {
          // Swiped left - go to next
          goToNext();
        }
      }

      setIsDragging(false);
      setDragOffset(0);
      isHorizontalSwipe.current = null;
    }, [swipeable, isDragging, swipeThreshold, goToPrev, goToNext]);

    // Touch handlers
    const handleTouchStart = useCallback(
      (e: TouchEvent<HTMLDivElement>) => {
        if (!swipeable) return;
        dragStartX.current = e.touches[0].clientX;
        dragStartY.current = e.touches[0].clientY;
        dragCurrentX.current = e.touches[0].clientX;
        isHorizontalSwipe.current = null;
        setIsDragging(true);
      },
      [swipeable]
    );

    const handleTouchMove = useCallback(
      (e: TouchEvent<HTMLDivElement>) => {
        if (!swipeable || !isDragging) return;

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = Math.abs(currentX - dragStartX.current);
        const deltaY = Math.abs(currentY - dragStartY.current);

        // Determine swipe direction on first significant move
        if (isHorizontalSwipe.current === null && (deltaX > 5 || deltaY > 5)) {
          isHorizontalSwipe.current = deltaX > deltaY;
        }

        // Only handle horizontal swipes
        if (isHorizontalSwipe.current) {
          e.preventDefault();
          dragCurrentX.current = currentX;
          const delta = dragCurrentX.current - dragStartX.current;
          setDragOffset(delta);
        }
      },
      [swipeable, isDragging]
    );

    // Mouse handlers for desktop drag
    const handleMouseDown = useCallback(
      (e: MouseEvent<HTMLDivElement>) => {
        if (!swipeable) return;
        e.preventDefault();
        dragStartX.current = e.clientX;
        dragCurrentX.current = e.clientX;
        setIsDragging(true);
      },
      [swipeable]
    );

    const handleMouseMove = useCallback(
      (e: MouseEvent<HTMLDivElement>) => {
        if (!swipeable || !isDragging) return;
        dragCurrentX.current = e.clientX;
        const delta = dragCurrentX.current - dragStartX.current;
        setDragOffset(delta);
      },
      [swipeable, isDragging]
    );

    const handleMouseUp = useCallback(() => {
      handleDragEnd();
    }, [handleDragEnd]);

    const handleMouseLeave = useCallback(() => {
      if (isDragging) {
        handleDragEnd();
      }
    }, [isDragging, handleDragEnd]);

    // Calculate transform
    const getTransform = () => {
      const baseOffset = currentIndex * -100;
      if (isDragging && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const dragPercent = (dragOffset / containerWidth) * 100;
        return `translateX(${baseOffset + dragPercent}%)`;
      }
      return `translateX(${baseOffset}%)`;
    };

    const shouldHideArrows = hideControlsOnTouch && isTouchDevice;
    const canGoPrev = loop || currentIndex > 0;
    const canGoNext = loop || currentIndex < slideCount - 1;

    return (
      <div
        ref={ref}
        className={clsx(
          'carousel',
          `carousel-fit-${objectFit}`,
          isDragging && 'carousel-dragging',
          className
        )}
        role="region"
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={pauseOnHover ? () => setIsPaused(true) : undefined}
        onMouseLeave={pauseOnHover ? () => { setIsPaused(false); handleMouseLeave(); } : handleMouseLeave}
        {...rest}
      >
        <div
          ref={containerRef}
          className="carousel-viewport"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            className="carousel-track"
            style={{
              transform: getTransform(),
              transition: isDragging ? 'none' : `transform ${transitionDuration}ms ease-out`,
            }}
          >
            {slides.map((slide, index) => (
              <div key={index} className="carousel-slide">
                {slide}
              </div>
            ))}
          </div>
        </div>

        {/* Clickable navigation zones */}
        {slideCount > 1 && (
          <>
            <button
              type="button"
              className="carousel-nav-zone carousel-nav-zone-prev"
              onClick={goToPrev}
              disabled={!canGoPrev}
              aria-label="Previous slide"
            />
            <button
              type="button"
              className="carousel-nav-zone carousel-nav-zone-next"
              onClick={goToNext}
              disabled={!canGoNext}
              aria-label="Next slide"
            />
          </>
        )}

        {/* Navigation Arrows */}
        {showArrows && !shouldHideArrows && slideCount > 1 && (
          <>
            <button
              type="button"
              className={clsx('carousel-arrow carousel-arrow-prev', arrowClassName)}
              onClick={goToPrev}
              disabled={!canGoPrev}
              aria-label="Previous slide"
            >
              {prevArrow ?? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              )}
            </button>
            <button
              type="button"
              className={clsx('carousel-arrow carousel-arrow-next', arrowClassName)}
              onClick={goToNext}
              disabled={!canGoNext}
              aria-label="Next slide"
            >
              {nextArrow ?? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
            </button>
          </>
        )}

        {/* Navigation Dots */}
        {showDots && slideCount > 1 && (
          <div className="carousel-dots" role="tablist">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={clsx('carousel-dot', dotClassName)}
                onClick={() => goToSlide(index)}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

Carousel.displayName = 'Carousel';
