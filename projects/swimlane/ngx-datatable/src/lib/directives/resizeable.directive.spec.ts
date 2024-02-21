import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ResizeableDirective } from './resizeable.directive';
import { ColumnResizeService } from '../services/column-resize.service';

@Component({
  selector: 'test-fixture-component',
  template: ` <div resizeable></div> `
})
class TestFixtureComponent {}

describe('ResizeableDirective', () => {
  let fixture: ComponentFixture<TestFixtureComponent>;
  let component: TestFixtureComponent;
  let element: any;

  // provide our implementations or mocks to the dependency injector
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResizeableDirective, TestFixtureComponent],
      providers: [ColumnResizeService]
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TestFixtureComponent);
      component = fixture.componentInstance;
      element = fixture.nativeElement;
    });
  }));

  describe('fixture', () => {
    let directive: ResizeableDirective;

    beforeEach(() => {
      directive = fixture.debugElement.query(By.directive(ResizeableDirective)).injector.get(ResizeableDirective);
    });

    it('should have a component instance', () => {
      expect(component).toBeTruthy();
    });

    it('should have ResizeableDirective directive', () => {
      expect(directive).toBeTruthy();
    });
  });
});
