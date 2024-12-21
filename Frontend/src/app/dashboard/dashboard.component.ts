import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { UserService } from '../user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('chart') chartContainer!: ElementRef; // Reference to the chart container
  selectedTimeframe: string = 'monthly'; // Default timeframe
  timeframes: string[] = ['daily', 'weekly', 'monthly', 'yearly'];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadProjectData();
  }

  loadProjectData(): void {
    this.userService.getGraphData(this.selectedTimeframe).subscribe((projects) => {
      console.log('Projects data:', projects); // Log the response
      const labels: string[] = [];
      const plannedHours: number[] = [];
      const actualHours: number[] = [];
  
      projects.forEach((project, index) => {
        // Use a default label based on the index
        labels.push(`Project ${index + 1}`); // Default label for each project
        
        // Directly use plannedHours and actualHours from the project
        plannedHours.push(project.plannedHours || 0); // Default to 0 if undefined
        actualHours.push(project.actualHours || 0); // Default to 0 if undefined
      });
  
      this.createChart(labels, plannedHours, actualHours);
    });
  }
  
  createChart(labels: string[], plannedHours: number[], actualHours: number[]): void {
    // Clear previous chart
    d3.select(this.chartContainer.nativeElement).selectAll('*').remove();
  
    const margin = { top: 20, right: 30, bottom: 60, left: 40 }; // Increased bottom margin for labels
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    const x = d3.scaleBand()
      .domain(labels)
      .range([0, width])
      .padding(0.1);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max([...plannedHours, ...actualHours])!])
      .nice()
      .range([height, 0]);
  
    // Planned hours bars
    svg.append('g')
      .selectAll('.bar-planned')
      .data(plannedHours)
      .enter()
      .append('rect')
      .attr('class', 'bar-planned')
      .attr('x', (d: number, i: number) => x(labels[i])!) // Position based on label
      .attr('y', (d: number) => y(d)) // Y position based on planned hours
      .attr('width', x.bandwidth() / 2) // Half the width for planned hours
      .attr('height', (d: number) => height - y(d)) // Height based on planned hours
      .attr('fill', 'steelblue');
  
    // Actual hours bars
    svg.append('g')
      .selectAll('.bar-actual')
      .data(actualHours)
      .enter()
      .append('rect')
      .attr('class', 'bar-actual')
      .attr('x', (d: number, i: number) => x(labels[i])! + x.bandwidth() / 2) // Shift to the right for actual hours
      .attr('y', (d: number) => y(d)) // Y position based on actual hours
      .attr('width', x.bandwidth() / 2) // Half the width for actual hours
      .attr('height', (d: number) => height - y(d)) // Height based on actual hours
      .attr('fill', 'orange');
  
    // Add labels for Planned Hours
    svg.append('g')
      .selectAll('.label-planned')
      .data(plannedHours)
      .enter()
      .append('text')
      .attr('class', 'label-planned')
      .attr('x', (d: number, i: number) => x(labels[i])! + x.bandwidth() / 4) // Centered under the planned bar
      .attr('y', (d: number) => y(d) + 15) // Position below the planned bar
      .attr('text-anchor', 'middle') // Center the text
      .text('Planned hrs');
  
    // Add labels for Actual Hours
    svg.append('g')
      .selectAll('.label-actual')
      .data(actualHours)
      .enter()
      .append('text')
      .attr('class', 'label-actual')
      .attr('x', (d: number, i: number) => x(labels[i])! + x.bandwidth() * 3 / 4) // Centered under the actual bar
      .attr('y', (d: number) => y(d) + 15) // Position below the actual bar
      .attr('text-anchor', 'middle') // Center the text
      .text('Actual hrs');
  
    // X-axis (without label)
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0)); // Remove x-axis ticks
  
    // Y-axis
    svg.append('g')
      .call(d3.axisLeft(y));
  
  
    // Y-axis
    svg.append('g')
      .call(d3.axisLeft(y));
  }
  onTimeframeChange(): void {
    this.loadProjectData();  // Reload the data based on selected timeframe
  }
}