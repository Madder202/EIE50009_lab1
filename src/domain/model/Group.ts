import { ContainerShape } from './ContainerShape.js';
export class Group extends ContainerShape {
  constructor(id: string) { super(id); }
  override get tag(): string { return 'g'; }
  override clone(): Group {
    const copy = new Group(this.id);
    this.copyChildrenTo(copy);
    return copy;
  }
}
