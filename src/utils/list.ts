/*!
 * list.js - double linked list for bcoin
 * Copyright (c) 2017-2018, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

import { assert } from './assert';

/**
 * List Item
 * @alias module:utils.ListItem<T>
 */
export class ListItem<T> {
    next: ListItem<T> | null;
    prev: ListItem<T> | null;
    value: T;

    /**
     * Create a list item.
     */
    constructor(value: T) {
        this.next = null;
        this.prev = null;
        this.value = value;
    }
}

/**
 * Double Linked List
 * @alias module:utils.List
 */
export default class List<T> {
    _head!: ListItem<T> | null;
    _tail!: ListItem<T> | null;
    size!: number;

    /**
     * Create a list.
     */
    constrctor(): void {
        this._head = null;
        this._tail = null;
        this.size = 0;
    }

    get head(): T {
        return this._head?.value as T;
    }

    get tail(): T {
        return this._tail?.value as T;
    }

    /**
     * Reset the cache. Clear all items.
     */
    reset(): void {
        let item, next;

        for (item = this._head; item; item = next) {
            next = item.next;
            item.prev = null;
            item.next = null;
        }

        assert(!item);

        this._head = null;
        this._tail = null;
        this.size = 0;
    }

    /**
     * Remove the first item in the list.
     */
    shift(): T | null {
        const item = this.head;

        if (!item) return null;

        this.remove(item);

        return item;
    }

    /**
     * Prepend an item to the linked list (sets new head).
     */
    unshift(item: ListItem<T>): boolean {
        return this.insert(null, item);
    }

    /**
     * Append an item to the linked list (sets new tail).
     */
    push(item: T): boolean {
        return this.insert(this._tail, new ListItem<T>(item));
    }

    /**
     * Remove the last item in the list.
     */
    pop(): T | null {
        const item = this.tail;

        if (!item) return null;

        this.remove(item);

        return item;
    }

    /**
     * Insert item into the linked list.
     */
    private insert(ref: ListItem<T> | null, item: ListItem<T>): boolean {
        if (item.prev || item.next || item === this._head) return false;

        assert(!item.prev);
        assert(!item.next);

        if (ref == null) {
            if (!this._head) {
                this._head = item;
                this._tail = item;
            } else {
                this._head.prev = item;
                item.next = this._head;
                this._head = item;
            }
            this.size += 1;
            return true;
        }

        item.next = ref.next;
        item.prev = ref;
        ref.next = item;

        if (item.next) item.next.prev = item;

        if (ref === this._tail) this._tail = item;

        this.size += 1;

        return true;
    }

    /**
     * Remove item from the linked list.
     */
    remove(item: T): boolean {
        const _item = new ListItem<T>(item);

        if (!_item.prev && !_item.next && _item !== this._head) return false;

        if (_item.prev) _item.prev.next = _item.next;

        if (_item.next) _item.next.prev = _item.prev;

        if (_item === this._head) this._head = _item.next;

        if (_item === this._tail) this._tail = _item.prev || this._head;

        if (!this._head) assert(!this._tail);

        if (!this._tail) assert(!this._head);

        _item.prev = null;
        _item.next = null;

        this.size -= 1;

        return true;
    }

    /**
     * Replace an item in-place.
     */
    replace(ref: ListItem<T>, item: ListItem<T>): void {
        if (ref.prev) ref.prev.next = item;

        if (ref.next) ref.next.prev = item;

        item.prev = ref.prev;
        item.next = ref.next;

        ref.next = null;
        ref.prev = null;

        if (this._head === ref) this._head = item;

        if (this._tail === ref) this._tail = item;
    }

    /**
     * Slice the list to an array of items.
     * Will remove the items sliced.
     */
    slice(total?: number | null): ListItem<T>[] {
        if (total == null) total = -1;

        const items = [];

        let next = null;

        for (let item = this._head; item; item = next) {
            next = item.next;
            item.prev = null;
            item.next = null;

            this.size -= 1;

            items.push(item);

            if (items.length === total) break;
        }

        if (next) {
            this._head = next;
            next.prev = null;
        } else {
            this._head = null;
            this._tail = null;
        }

        return items;
    }

    /**
     * Convert the list to an array of items.
     */
    toArray(): ListItem<T>[] {
        const items = [];

        for (let item = this._head; item; item = item.next) items.push(item);

        return items;
    }
}
