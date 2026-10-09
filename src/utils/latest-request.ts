export class LatestRequest {
  private id = 0
  private controller?: AbortController

  begin(): { id: number; signal: AbortSignal } {
    this.controller?.abort()
    this.controller = new AbortController()
    return { id: ++this.id, signal: this.controller.signal }
  }

  isCurrent(id: number): boolean { return id === this.id }
  cancel(): void { this.controller?.abort(); this.id++ }
}
