import type { ReactElement } from 'react'

export interface BaseNavItem {
  id: string
  label: string
  icon?: ReactElement
  iconBgColor?: string
}

export interface NavLinkItem extends BaseNavItem {
  to: string
  items?: never
}

export interface NavMenuItem extends BaseNavItem {
  items: NavItem[]
  to?: never
}

export type NavItem = NavMenuItem | NavLinkItem

export interface NavConfig {
  items: NavItem[]
}

// Type guard to check if item is a link (leaf node)
export const isNavLinkItem = (item: NavItem): item is NavLinkItem => 'to' in item && typeof item.to === 'string'

// Type guard to check if item has children
export const isNavMenuItem = (item: NavItem): item is NavMenuItem => 'items' in item && Array.isArray(item.items)
