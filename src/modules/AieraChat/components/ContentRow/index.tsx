import { IconProps } from '@aiera/client-sdk/types';
import classNames from 'classnames';
import React, { ComponentType, ReactNode } from 'react';

export function ContentRow({
    text,
    children,
    onClick,
    onClickIcon,
    Icon,
    iconClassName,
    className,
}: {
    children?: ReactNode;
    text?: string;
    className?: string;
    iconClassName?: string | string[];
    Icon?: ComponentType<IconProps> | ComponentType<IconProps>[];
    onClick: () => void;
    onClickIcon: (() => void) | (() => void)[];
}) {
    return (
        <div
            className={classNames(
                'flex hover:bg-slate-200/80 pl-2.5 pr-1.5 aiera-chat-contentRow',
                'rounded-lg justify-between items-center py-1 text-slate-600',
                className
            )}
            onClick={onClick}
        >
            {children ? (
                children
            ) : (
                <p className="text-base flex-1 line-clamp-1 hover:text-blue-700 cursor-pointer">{text}</p>
            )}
            {Array.isArray(Icon)
                ? Icon.map((IconItem, index) => {
                      const iconClass = Array.isArray(iconClassName) ? iconClassName[index] : iconClassName;
                      const fn = Array.isArray(onClickIcon) ? onClickIcon[index] : onClickIcon;
                      return (
                          <div
                              key={`icon-${index}`}
                              className="ml-2 flex-shrink-0"
                              onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  if (fn) {
                                      fn();
                                  }
                              }}
                          >
                              <IconItem className={classNames('w-4 cursor-pointer', iconClass)} />
                          </div>
                      );
                  })
                : Icon && (
                      <div
                          className="ml-2 flex-shrink-0"
                          onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              if (!Array.isArray(onClickIcon)) {
                                  onClickIcon();
                              }
                          }}
                      >
                          <Icon className={classNames('w-4 cursor-pointer', iconClassName)} />
                      </div>
                  )}
        </div>
    );
}
