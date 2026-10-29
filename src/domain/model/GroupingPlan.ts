import { ContainerShape } from './ContainerShape.js';
import { Group } from './Group.js';
import type { Shape } from './Shape.js';
/** Validates and captures all positions before changing any parent. */
export class GroupingPlan {
  readonly #parent: ContainerShape;
  readonly #index: number;
  readonly #nodes: readonly Shape[];
  readonly #parentOf: (node: Shape) => ContainerShape;
  constructor(root: ContainerShape, selected: readonly Shape[], parentOf: (node: Shape) => ContainerShape) {
    this.#parentOf = parentOf;
    const selection = new Set(selected);
    for (const node of selected) {
      let parent = parentOf(node);
      while (parent !== root) {
        if (selection.has(parent)) throw new Error('cannot group a container into its own descendant: ' + parent.id);
        parent = parentOf(parent);
      }
    }
    const ordered: Shape[] = [];
    const visit = (container: ContainerShape): void => container.visitOwned(node => {
      if (selection.has(node)) ordered.push(node);
      if (node instanceof ContainerShape) visit(node);
    });
    visit(root);
    this.#nodes = ordered;
    const ancestors = (node: Shape): ContainerShape[] => {
      const result: ContainerShape[] = [];
      let parent = parentOf(node);
      for (;;) {
        result.push(parent);
        if (parent === root) return result;
        parent = parentOf(parent);
      }
    };
    const paths = selected.map(ancestors);
    this.#parent = paths[0]!.find(parent => paths.every(path => path.includes(parent)))!;
    this.#index = Math.min(...ordered.map(node => {
      let branch = node;
      while (parentOf(branch) !== this.#parent) branch = parentOf(branch);
      return this.#parent.indexOf(branch.id);
    }));
  }
  apply(group: Group): void {
    this.#parent.insertOwned(group, this.#index);
    for (const node of this.#nodes) {
      this.#parentOf(node).removeOwned(node.id);
      group.insertOwned(node);
    }
  }
}
