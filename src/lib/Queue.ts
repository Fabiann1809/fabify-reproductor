export interface SongNode<T> {
  value: T;
  prev: SongNode<T> | null;
  next: SongNode<T> | null;
}

export class Queue<T> {
  private head: SongNode<T> | null = null;
  private tail: SongNode<T> | null = null;
  private _size: number = 0;

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  getHead(): SongNode<T> | null {
    return this.head;
  }

  getTail(): SongNode<T> | null {
    return this.tail;
  }

  append(value: T): SongNode<T> {
    const node: SongNode<T> = { value, prev: null, next: null };
    if (this.tail === null) {
      this.head = node;
      this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this._size++;
    return node;
  }

  prepend(value: T): SongNode<T> {
    const node: SongNode<T> = { value, prev: null, next: null };
    if (this.head === null) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this._size++;
    return node;
  }

  insertAfter(refNode: SongNode<T>, value: T): SongNode<T> {
    if (refNode === this.tail) {
      return this.append(value);
    }
    const node: SongNode<T> = { value, prev: refNode, next: refNode.next };
    if (refNode.next !== null) {
      refNode.next.prev = node;
    }
    refNode.next = node;
    this._size++;
    return node;
  }

  // Moves an existing node to a new position in O(1), no new nodes created.
  moveAfter(nodeToMove: SongNode<T>, afterNode: SongNode<T> | null): void {
    if (nodeToMove === afterNode) return;

    // 1) Detach nodeToMove from its current position.
    if (nodeToMove.prev !== null) {
      nodeToMove.prev.next = nodeToMove.next;
    } else {
      this.head = nodeToMove.next;
    }
    if (nodeToMove.next !== null) {
      nodeToMove.next.prev = nodeToMove.prev;
    } else {
      this.tail = nodeToMove.prev;
    }

    // 2) Re-link after afterNode (null means move to head).
    if (afterNode === null) {
      nodeToMove.prev = null;
      nodeToMove.next = this.head;
      if (this.head !== null) this.head.prev = nodeToMove;
      this.head = nodeToMove;
      if (this.tail === null) this.tail = nodeToMove;
    } else {
      nodeToMove.prev = afterNode;
      nodeToMove.next = afterNode.next;
      if (afterNode.next !== null) afterNode.next.prev = nodeToMove;
      afterNode.next = nodeToMove;
      if (nodeToMove.next === null) this.tail = nodeToMove;
    }
    // _size does not change: node moved, not added/removed.
  }

  remove(node: SongNode<T>): void {
    // Guard: node already removed or not part of this list.
    if (node.prev === null && node.next === null && node !== this.head) return;

    if (node.prev !== null) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next !== null) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
    node.prev = null;
    node.next = null;
    this._size--;
  }

  findNode(predicate: (v: T) => boolean): SongNode<T> | null {
    let current = this.head;
    while (current !== null) {
      if (predicate(current.value)) return current;
      current = current.next;
    }
    return null;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current !== null) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  // Returns all nodes in current order.
  getNodes(): SongNode<T>[] {
    const nodes: SongNode<T>[] = [];
    let cur = this.head;
    while (cur !== null) { nodes.push(cur); cur = cur.next; }
    return nodes;
  }

  // Re-links existing nodes in the provided order.
  reorderNodes(nodes: SongNode<T>[]): void {
    if (nodes.length === 0) { this.head = null; this.tail = null; return; }
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].prev = nodes[i - 1] ?? null;
      nodes[i].next = nodes[i + 1] ?? null;
    }
    this.head = nodes[0];
    this.tail = nodes[nodes.length - 1];
  }

  // Shuffles by re-linking pointers. Existing node references stay valid.
  // If anchorNode is provided, it is kept at the start.
  shuffleNodes(anchorNode?: SongNode<T> | null): void {
    const nodes = this.getNodes();
    if (nodes.length <= 1) return;

    // Separate anchor from the rest.
    let anchor: SongNode<T> | null = null;
    let rest = nodes;
    if (anchorNode) {
      const idx = nodes.indexOf(anchorNode);
      if (idx > -1) {
        anchor = nodes[idx];
        rest = [...nodes.slice(0, idx), ...nodes.slice(idx + 1)];
      }
    }

    // Fisher-Yates over the remaining nodes.
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }

    this.reorderNodes(anchor ? [anchor, ...rest] : rest);
  }

  reverse(): void {
    const nodes = this.getNodes();
    nodes.reverse();
    this.reorderNodes(nodes);
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this._size = 0;
  }
}
