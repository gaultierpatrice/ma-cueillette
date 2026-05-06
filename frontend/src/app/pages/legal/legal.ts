import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-legal',
  imports: [RouterModule],
  templateUrl: './legal.html',
  styles: [`
    .legal-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }

    h1 {
      color: #2c5f2d;
      border-bottom: 3px solid #2c5f2d;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }

    h2 {
      color: #2c5f2d;
      margin-top: 30px;
      margin-bottom: 15px;
      font-size: 1.5em;
    }

    .important-notice {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }

    .important-notice strong {
      color: #856404;
    }

    .legal-section {
      margin-bottom: 30px;
    }

    .legal-section p {
      margin-bottom: 15px;
    }

    .legal-section ul {
      list-style-type: disc;
      padding-left: 30px;
      margin-bottom: 15px;
    }

    .legal-section li {
      margin-bottom: 8px;
    }

    .last-update {
      font-size: 0.9em;
      color: #666;
      margin-top: 40px;
      font-style: italic;
    }

    .navigation-links {
      display: flex;
      gap: 20px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      flex-wrap: wrap;
    }

    .navigation-links a {
      color: #2c5f2d;
      text-decoration: none;
      padding: 8px 16px;
      border: 1px solid #2c5f2d;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .navigation-links a:hover {
      background-color: #2c5f2d;
      color: white;
    }

    @media (max-width: 768px) {
      .legal-container {
        padding: 15px;
      }

      h1 {
        font-size: 1.8em;
      }

      h2 {
        font-size: 1.3em;
      }

      .navigation-links {
        flex-direction: column;
        gap: 10px;
      }

      .navigation-links a {
        text-align: center;
      }
    }
  `]
})
export class LegalComponent {}
