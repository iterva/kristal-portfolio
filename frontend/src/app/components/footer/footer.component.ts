import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="container">
        <p>&copy; {{ year }} Kristal — Portafolio Personal</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      border-top: 1px solid var(--border);
      padding: 24px 0;
      text-align: center;
    }
    p {
      color: var(--text-muted);
      font-size: 14px;
    }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
