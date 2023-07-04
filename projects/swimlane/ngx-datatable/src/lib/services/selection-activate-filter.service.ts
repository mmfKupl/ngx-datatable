import { Model } from '../components/body/selection.component';

/**
 * service to make DataTableSelectionComponent more flexible with controlling activate events
 */
export abstract class SelectionActivateFilterService {
  abstract shouldPreventActivateEvent(model: Model): boolean;
}
